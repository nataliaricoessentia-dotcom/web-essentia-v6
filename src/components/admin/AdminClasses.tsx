import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ClassItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

const AdminClasses = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState("");

  const fetchClasses = async () => {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .order("display_order");
    setClasses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setSaving(true);
    const maxOrder = classes.reduce((max, c) => Math.max(max, c.display_order), 0);
    await supabase.from("classes").insert({
      title: newTitle,
      description: newDesc,
      image_url: newImage || "",
      display_order: maxOrder + 1,
    });
    toast({ title: "Clase añadida" });
    setNewTitle(""); setNewDesc(""); setNewImage("");
    setShowNew(false);
    setSaving(false);
    await fetchClasses();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("classes").delete().eq("id", id);
    toast({ title: "Clase eliminada" });
    await fetchClasses();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("classes").update({ is_active: !current }).eq("id", id);
    toast({ title: current ? "Clase ocultada" : "Clase visible" });
    await fetchClasses();
  };

  const startEdit = (c: ClassItem) => {
    setEditingId(c.id);
    setEditTitle(c.title);
    setEditDesc(c.description);
    setEditImage(c.image_url);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editTitle) return;
    await supabase.from("classes").update({
      title: editTitle,
      description: editDesc,
      image_url: editImage,
    }).eq("id", editingId);
    toast({ title: "Clase actualizada" });
    setEditingId(null);
    await fetchClasses();
  };

  if (loading) return <div className="text-muted-foreground font-body py-8 text-center">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Clases semanales</h2>
        <Button onClick={() => setShowNew(!showNew)} size="sm" className="gap-2">
          <Plus size={16} /> Nueva clase
        </Button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <form onSubmit={handleCreate} className="bg-card rounded-2xl p-6 border border-border mb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-body">Título *</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Nombre de la clase" required className="mt-1" />
                </div>
                <div>
                  <Label className="font-body">URL de imagen</Label>
                  <Input value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="https://..." className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="font-body">Descripción</Label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe la clase..."
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
        {classes.map((c) => (
          <div key={c.id} className="bg-card rounded-xl border border-border p-4">
            {editingId === c.id ? (
              <div className="space-y-3">
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Título" />
                <Input value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="URL imagen" />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>Guardar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {c.image_url && (
                  <img src={c.image_url} alt={c.title} className="w-16 h-12 rounded object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-foreground text-sm truncate">{c.title}</p>
                  <p className="font-body text-xs text-muted-foreground truncate">{c.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(c.id, c.is_active)}
                    className={`text-xs font-body px-2 py-1 rounded ${c.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    {c.is_active ? "Visible" : "Oculto"}
                  </button>
                  <button onClick={() => startEdit(c)} className="text-muted-foreground hover:text-foreground">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {classes.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-8">No hay clases</p>
        )}
      </div>
    </div>
  );
};

export default AdminClasses;
