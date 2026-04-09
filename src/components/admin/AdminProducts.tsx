import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  purchase_url: string;
  discount_code: string;
  is_active: boolean;
  display_order: number;
}

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    const { data } = await (supabase.from("products" as any) as any)
      .select("*")
      .order("display_order");
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setSaving(true);
    const maxOrder = products.reduce((max, p) => Math.max(max, p.display_order), 0);
    await (supabase.from("products" as any) as any).insert({
      name: newName,
      description: newDesc,
      image_url: newImage || "",
      purchase_url: newUrl || "",
      discount_code: newDiscount || "",
      display_order: maxOrder + 1,
    });
    toast({ title: "Producto añadido" });
    setNewName(""); setNewDesc(""); setNewImage(""); setNewUrl(""); setNewDiscount("");
    setShowNew(false);
    setSaving(false);
    await fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("products" as any) as any).delete().eq("id", id);
    toast({ title: "Producto eliminado" });
    await fetchProducts();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await (supabase.from("products" as any) as any).update({ is_active: !current }).eq("id", id);
    toast({ title: current ? "Producto ocultado" : "Producto visible" });
    await fetchProducts();
  };

  if (loading) return <div className="text-muted-foreground font-body py-8 text-center">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Productos recomendados</h2>
        <Button onClick={() => setShowNew(!showNew)} size="sm" className="gap-2">
          <Plus size={16} /> Nuevo producto
        </Button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <form onSubmit={handleCreate} className="bg-card rounded-2xl p-6 border border-border mb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-body">Nombre *</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del producto" required className="mt-1" />
                </div>
                <div>
                  <Label className="font-body">URL de imagen</Label>
                  <Input value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="https://..." className="mt-1" />
                </div>
                <div>
                  <Label className="font-body">Enlace de compra</Label>
                  <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." className="mt-1" />
                </div>
                <div>
                  <Label className="font-body">Código descuento</Label>
                  <Input value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} placeholder="Ej: ESSENTIA10" className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="font-body">Descripción</Label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe el producto..."
                  rows={2}
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
        {products.map((p) => (
          <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            {p.image_url && (
              <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-body font-medium text-foreground text-sm truncate">{p.name}</p>
              {p.discount_code && <p className="font-body text-xs text-primary">Código: {p.discount_code}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleActive(p.id, p.is_active)}
                className={`text-xs font-body px-2 py-1 rounded ${p.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
              >
                {p.is_active ? "Visible" : "Oculto"}
              </button>
              <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-8">No hay productos</p>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
