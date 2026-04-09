import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller identity
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: callerUser }, error: userError } = await callerClient.auth.getUser();
    if (userError || !callerUser) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Se requiere rol de administrador" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { email, full_name, phone } = await req.json();
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email es obligatorio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate random temporary password (user will set their own via recovery email)
    const tempPassword = crypto.randomUUID() + "Aa1!";

    // Create user with service role
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: full_name || "" },
    });

    if (createError) {
      // Translate common errors
      let msg = createError.message;
      if (msg.includes("already been registered") || msg.includes("already exists")) {
        msg = "Ya existe una cuenta con este email";
      }
      return new Response(JSON.stringify({ error: msg }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update profile with phone if provided
    if (newUser.user && (phone || full_name)) {
      await adminClient
        .from("profiles")
        .update({ phone: phone || "", full_name: full_name || "" })
        .eq("user_id", newUser.user.id);
    }

    // Send password recovery email so the user can set their own password.
    // resetPasswordForEmail actually sends the email (unlike generateLink which only returns a URL).
    const { error: resetError } = await adminClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${supabaseUrl.replace('.supabase.co', '.supabase.co')}/auth/v1/callback`,
    });

    if (resetError) {
      console.error("Recovery email error:", resetError);
    }

    return new Response(
      JSON.stringify({
        user: { id: newUser.user.id, email: newUser.user.email },
        recovery_sent: !resetError,
        recovery_error: resetError?.message || null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in admin-create-user-v2:", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
