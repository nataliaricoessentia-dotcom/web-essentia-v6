import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import fasciaImg from "@/assets/fascia-webinar.png";
import respiracionImg from "@/assets/respiracion-webinar.png";
import endometriosisImg from "@/assets/endometriosis-webinar.png";

const fallbackImages: Record<string, string> = {
  "¿Qué es la fascia y por qué importa?": fasciaImg,
  "Respiración funcional: primeros pasos": respiracionImg,
  "Lo que no te contaron sobre la endometriosis": endometriosisImg,
};

interface FreeResource {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
}

const ResourcesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [resources, setResources] = useState<FreeResource[]>([]);
  const { toast } = useToast();

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState<FreeResource | null>(null);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadConsent, setLeadConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("unlocked_resources");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    supabase
      .from("free_resources")
      .select("id, title, url, thumbnail_url")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setResources(data || []));
  }, []);

  const handleResourceClick = (resource: FreeResource) => {
    if (unlockedIds.has(resource.id)) {
      if (resource.url && resource.url !== "#") {
        window.open(resource.url, "_blank", "noopener,noreferrer");
      }
      return;
    }
    setSelectedResource(resource);
    setShowLeadForm(true);
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = leadEmail.trim().toLowerCase();
    if (!trimmedEmail || !leadConsent || !selectedResource) return;

    if (!isValidEmail(trimmedEmail)) {
      toast({ title: "Email no válido", description: "Introduce un email con formato correcto.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    // Check for duplicate (same email + same resource)
    const { data: existing } = await supabase
      .from("free_resource_leads")
      .select("id")
      .eq("email", trimmedEmail)
      .eq("resource_id", selectedResource.id)
      .maybeSingle();

    if (existing) {
      // Already submitted — just unlock without re-inserting
    } else {
      await supabase.from("free_resource_leads").insert({
        email: trimmedEmail,
        consent: leadConsent,
        resource_id: selectedResource.id,
        resource_title: selectedResource.title,
      });
    }

    const newUnlocked = new Set(unlockedIds);
    newUnlocked.add(selectedResource.id);
    setUnlockedIds(newUnlocked);
    localStorage.setItem("unlocked_resources", JSON.stringify([...newUnlocked]));

    setSubmitting(false);
    setShowLeadForm(false);
    setLeadEmail("");
    setLeadConsent(false);

    toast({ title: "¡Acceso desbloqueado!" });

    if (selectedResource.url && selectedResource.url !== "#") {
      window.open(selectedResource.url, "_blank", "noopener,noreferrer");
    }
  };

  if (resources.length === 0) return null;

  return (
    <section id="recursos" className="py-24 bg-muted">
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Aprende gratis</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Recursos gratuitos
          </h2>
          <p className="text-foreground/70 font-body max-w-xl mx-auto">
            Accede a webinars y clases de captación sin coste para dar tus primeros pasos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {resources.map((r, i) => (
            <motion.button
              key={r.id}
              onClick={() => handleResourceClick(r)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.6, delay: 0.15 * i }}
              className="group rounded-2xl overflow-hidden bg-card hover:shadow-xl transition-all duration-300 text-left"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={r.thumbnail_url || fallbackImages[r.title] || ""}
                  alt={r.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lead Capture Modal */}
      {showLeadForm && selectedResource && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 max-w-md w-full border border-border relative"
          >
            <button
              onClick={() => { setShowLeadForm(false); setSelectedResource(null); }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Accede al recurso gratuito
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Introduce tu email para acceder a "{selectedResource.title}"
            </p>
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={leadConsent}
                  onChange={(e) => setLeadConsent(e.target.checked)}
                  required
                  className="mt-1 rounded border-border"
                />
                <span className="font-body text-xs text-muted-foreground leading-relaxed">
                  Acepto recibir comunicaciones y confirmo que he leído la política de privacidad.
                </span>
              </label>
              <Button type="submit" className="w-full" disabled={submitting || !leadConsent}>
                {submitting ? "Procesando..." : "Acceder al recurso"}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default ResourcesSection;
