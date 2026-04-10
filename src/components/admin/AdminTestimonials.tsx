import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Quote, Pencil, Video, FileText, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string | null;
  video_url: string | null;
  is_active: boolean;
  display_order: number;
}

const AdminTestimonials = () => {
  const { toast } = useToast();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newText, setNewText] = useState("");
  const [newVideo, setNewVideo] = useState("");
const [sectionVisible, setSectionVisible] = useState(true);
const [savingSection, setSavingSection] = useState(false);
 const fetchTestimonials = async () => {
  const [{ data: testimonialsData }, { data: sectionData }] = await Promise.all([
    supabase.from("testimonials").select("*").order("display_order"),
    supabase
      .from("section_settings")
      .select("is_visible")
      .eq("section_key", "testimonials")
      .maybeSingle(),
  ]);

  setTestimonials(testimonialsData || []);
  setSectionVisible(sectionData?.is_visible ?? true);
  setLoading(false);
};

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNewName("");
    setNewRole("");
    setNewText("");
    setNewVideo("");
  };

  const handleOpenNew = () => {
    resetForm();
    setShowNew(true);
  };

  const handleCancel = () => {
    resetForm();
    setShowNew(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      toast({
        title: "Falta el nombre",
        description: "Debes indicar el nombre del testimonio.",
        variant: "destructive",
      });
      return;
    }

    if (!newText.trim() && !newVideo.trim()) {
      toast({
        title: "Falta contenido",
        description: "Añade texto o una URL de vídeo.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const maxOrder = testimonials.reduce((max, t) => Math.max(max, t.display_order || 0), 0);

    const { error } = await supabase.from("testimonials").insert({
      name: newName.trim(),
      role: newRole.trim(),
      text: newText.trim() || null,
      video_url: newVideo.trim() || null,
      display_order: maxOrder + 1,
      is_active: true,
    });

    setSaving(false);

    if (error) {
      toast({
        title: "Error al añadir testimonio",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Testimonio añadido" });

    resetForm();
    setShowNew(false);
    await fetchTestimonials();
  };

  const handleStartEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setNewName(t.name || "");
    setNewRole(t.role || "");
    setNewText(t.text || "");
    setNewVideo(t.video_url || "");
    setShowNew(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId) return;

    if (!newName.trim()) {
      toast({
        title: "Falta el nombre",
        description: "Debes indicar el nombre del testimonio.",
        variant: "destructive",
      });
      return;
    }

    if (!newText.trim() && !newVideo.trim()) {
      toast({
        title: "Falta contenido",
        description: "Añade texto o una URL de vídeo.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("testimonials")
      .update({
        name: newName.trim(),
        role: newRole.trim(),
        text: newText.trim() || null,
        video_url: newVideo.trim() || null,
      })
      .eq("id", editingId);

    setSaving(false);

    if (error) {
      toast({
        title: "Error al actualizar testimonio",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Testimonio actualizado" });

    resetForm();
    setShowNew(false);
    await fetchTestimonials();
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("¿Seguro que quieres eliminar este testimonio?");
    if (!ok) return;

    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error al eliminar testimonio",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Testimonio eliminado" });
    await fetchTestimonials();
  };

  const toggleSectionVisibility = async () => {
  setSavingSection(true);

  const { error } = await supabase.from("section_settings").upsert(
    {
      section_key: "testimonials",
      is_visible: !sectionVisible,
    },
    { onConflict: "section_key" }
  );

  setSavingSection(false);

  if (error) {
    toast({
      title: "Error al cambiar la visibilidad de la sección",
      description: error.message,
      variant: "destructive",
    });
    return;
  }

  setSectionVisible(!sectionVisible);

  toast({
    title: !sectionVisible ? "Sección Testimonios visible" : "Sección Testimonios oculta",
  });
};

  if (loading) {
    return <div className="text-muted-foreground font-body py-8 text-center">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
  <h2 className="font-display text-2xl font-semibold text-foreground">Testimonios</h2>

  <div className="flex items-center gap-2">
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleSectionVisibility}
      disabled={savingSection}
      className="gap-2"
    >
      {sectionVisible ? <Eye size={16} /> : <EyeOff size={16} />}
      {sectionVisible ? "Sección visible" : "Sección oculta"}
    </Button>

    <Button onClick={handleOpenNew} size="sm" className="gap-2">
      <Plus size={16} /> Nuevo testimonio
    </Button>
  </div>
</div>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={editingId ? handleUpdate : handleCreate}
              className="bg-card rounded-2xl p-6 border border-border mb-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-body">Nombre *</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-body">Rol / Servicio</Label>
                  <Input
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Ej: Alumna Fascia Yoga"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="font-body flex items-center gap-2">
                  <FileText size={14} />
                  Texto del testimonio
                </Label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Escribe el testimonio..."
                  rows={4}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <Label className="font-body flex items-center gap-2">
                  <Video size={14} />
                  URL de vídeo
                </Label>
                <Input
                  value={newVideo}
                  onChange={(e) => setNewVideo(e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <p className="text-xs text-muted-foreground font-body">
                Puedes añadir texto, vídeo o ambos. Debe haber al menos uno de los dos.
              </p>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} size="sm">
                  {saving
                    ? editingId
                      ? "Actualizando..."
                      : "Añadiendo..."
                    : editingId
                    ? "Actualizar"
                    : "Añadir"}
                </Button>

                <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
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
              {t.text && (
                <p className="font-body text-foreground/80 italic text-sm mb-2">
                  "{t.text}"
                </p>
              )}

              {t.video_url && (
                <p className="font-body text-xs text-primary mb-2 break-all">
                  Vídeo: {t.video_url}
                </p>
              )}

              <p className="font-display font-semibold text-foreground text-sm">{t.name}</p>

              {t.role && (
                <p className="font-body text-xs text-muted-foreground">{t.role}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleActive(t.id, t.is_active)}
                className={`text-xs font-body px-2 py-1 rounded ${
                  t.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}
                title={t.is_active ? "Ocultar testimonio" : "Mostrar testimonio"}
              >
                {t.is_active ? "Visible" : "Oculto"}
              </button>

              <button
                onClick={() => handleStartEdit(t)}
                className="text-muted-foreground hover:text-foreground"
                title="Editar testimonio"
              >
                <Pencil size={14} />
              </button>

              <button
                onClick={() => handleDelete(t.id)}
                className="text-muted-foreground hover:text-destructive"
                title="Eliminar testimonio"
              >
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