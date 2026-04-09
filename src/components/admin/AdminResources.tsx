import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FreeResource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  display_order: number;
}

const AdminResources = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<FreeResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newThumb, setNewThumb] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchResources = async () => {
    const { data } = await supabase
      .from("free_resources")
      .select("*")
      .order("display_order");
    setResources(data || []);
    setLoading(false);
  };

  useState(() => { fetchResources(); });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setSaving(true);
    const maxOrder = resources.reduce((max, r) => Math.max(max, r.display_order), 0);
    await supabase.from("free_resources").insert({
      title: newTitle,
      url: newUrl || "#",
      thumbnail_url: newThumb || null,
      display_order: maxOrder + 1,
    });
    toast({ title: "Recurso añadido" });
    setNewTitle(""); setNewUrl(""); setNewThumb("");
    setShowNew(false);
    setSaving(false);
    await fetchResources();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("free_resources").delete().eq("id", id);
    toast({ title: "Recurso eliminado" });
    await fetchResources();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("free_resources").update({ is_active: !current }).eq("id", id);
    toast({ title: current ? "Recurso ocultado" : "Recurso visible" });
    await fetchResources();
  };

  if (loading) return <div className="text-muted-foreground font-body py-8 text-center">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Recursos gratuitos</h2>
        <Button onClick={() => setShowNew(!showNew)} size="sm" className="gap-2">
          <Plus size={16} /> Nuevo recurso
        </Button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <form onSubmit={handleCreate} className="bg-card rounded-2xl p-6 border border-border mb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-body">Título *</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título del recurso" required className="mt-1" />
                </div>
                <div>
                  <Label className="font-body">URL del vídeo</Label>
                  <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://youtube.com/..." className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="font-body">URL de la miniatura (imagen)</Label>
                <Input value={newThumb} onChange={(e) => setNewThumb(e.target.value)} placeholder="https://..." className="mt-1" />
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
        {resources.map((r) => (
          <div key={r.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            {r.thumbnail_url && (
              <img src={r.thumbnail_url} alt={r.title} className="w-16 h-10 rounded object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-body font-medium text-foreground text-sm truncate">{r.title}</p>
              {r.url && r.url !== "#" && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-0.5">
                  <ExternalLink size={10} /> Ver
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleActive(r.id, r.is_active)}
                className={`text-xs font-body px-2 py-1 rounded ${r.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
              >
                {r.is_active ? "Visible" : "Oculto"}
              </button>
              <button onClick={() => handleDelete(r.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {resources.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-8">No hay recursos gratuitos</p>
        )}
      </div>
    </div>
  );
};

export default AdminResources;
