import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  is_active: boolean;
  display_order: number;
}

const AdminTestimonials = () => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newText, setNewText] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("display_order");
    setTestimonials(data || []);
    setLoading(false);
  };

  useState(() => { fetchTestimonials(); });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newText) return;
    setSaving(true);
    const maxOrder = testimonials.reduce((max, t) => Math.max(max, t.display_order), 0);
    await supabase.from("testimonials").insert({
      name: newName,
      role: newRole,
      text: newText,
      display_order: maxOrder + 1,
    });
    toast({ title: "Testimonio añadido" });
    setNewName(""); setNewRole(""); setNewText("");
    setShowNew(false);
    setSaving(false);
    await fetchTestimonials();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("testimonials").delete().eq("id", id);
    toast({ title: "Testimonio eliminado" });
    await fetchTestimonials();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("testimonials").update({ is_active: !current }).eq("id", id);
    toast({ title: current ? "Testimonio ocultado" : "Testimonio visible" });
    await fetchTestimonials();
  };

  if (loading) return <div className="text-muted-foreground font-body py-8 text-center">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Testimonios</h2>
        <Button onClick={() => setShowNew(!showNew)} size="sm" className="gap-2">
          <Plus size={16} /> Nuevo testimonio
        </Button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <form onSubmit={handleCreate} className="bg-card rounded-2xl p-6 border border-border mb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-body">Nombre *</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre" required className="mt-1" />
                </div>
                <div>
                  <Label className="font-body">Rol / Servicio</Label>
                  <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Ej: Alumna Fascia Yoga" className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="font-body">Texto del testimonio *</Label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Escribe el testimonio..."
                  required
                  rows={3}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} size="sm">{saving ? "Guardando..." : "Añadir"}</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowNew(false)}>Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <Quote className="w-6 h-6 text-primary/30 shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <p className="font-body text-foreground/80 italic text-sm mb-2">"{t.text}"</p>
              <p className="font-display font-semibold text-foreground text-sm">{t.name}</p>
              {t.role && <p className="font-body text-xs text-muted-foreground">{t.role}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleActive(t.id, t.is_active)}
                className={`text-xs font-body px-2 py-1 rounded ${t.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
              >
                {t.is_active ? "Visible" : "Oculto"}
              </button>
              <button onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {testimonials.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-8">No hay testimonios</p>
        )}
      </div>
    </div>
  );
};

export default AdminTestimonials;
