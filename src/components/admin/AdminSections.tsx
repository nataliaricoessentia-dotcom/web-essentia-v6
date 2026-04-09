import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

interface SectionSetting {
  id: string;
  section_key: string;
  is_visible: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  products: "Productos",
  resources: "Recursos gratuitos",
  testimonials: "Testimonios",
};

const AdminSections = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<SectionSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    const { data } = await supabase
      .from("section_settings")
      .select("*")
      .order("section_key");
    setSections(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSections(); }, []);

  const toggleVisibility = async (id: string, current: boolean) => {
    await supabase
      .from("section_settings")
      .update({ is_visible: !current, updated_at: new Date().toISOString() })
      .eq("id", id);
    toast({ title: current ? "Sección ocultada" : "Sección visible" });
    await fetchSections();
  };

  if (loading) return <div className="text-muted-foreground font-body py-8 text-center">Cargando...</div>;

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Visibilidad de secciones</h2>
      <p className="text-muted-foreground font-body text-sm mb-6">
        Activa o desactiva secciones completas de la web sin tocar código.
      </p>
      <div className="space-y-3">
        {sections.map((s) => (
          <div key={s.id} className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
            <div>
              <p className="font-body font-medium text-foreground">
                {SECTION_LABELS[s.section_key] || s.section_key}
              </p>
            </div>
            <button
              onClick={() => toggleVisibility(s.id, s.is_visible)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body transition-colors ${
                s.is_visible
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {s.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
              {s.is_visible ? "Visible" : "Oculta"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSections;
