import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Redirect to student area once auth state confirms user
  useEffect(() => {
    if (!authLoading && user) {
      window.location.replace("/alumno");
    }
  }, [user, authLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast({
        title: "Error al iniciar sesión",
        description: error.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos"
          : error.message,
        variant: "destructive",
      });
      return;
    }
    // Hard redirect to avoid race conditions with auth state
    window.location.href = "/alumno";
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Email enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      });
      setMode("login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="font-display text-2xl text-primary italic">
            Natalia Essentia
          </a>
          <p className="text-muted-foreground font-body mt-2">
            {mode === "login" ? "Accede a tu área de alumn@" : "Recupera tu contraseña"}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email" className="font-body text-foreground/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password" className="font-body text-foreground/80">Contraseña</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Iniciar sesión"}
              </Button>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="w-full text-sm text-primary hover:underline font-body"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-body"
              >
                <ArrowLeft size={14} /> Volver
              </button>
              <div>
                <Label htmlFor="reset-email" className="font-body text-foreground/80">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-muted-foreground hover:text-primary font-body">
            ← Volver a la web
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
