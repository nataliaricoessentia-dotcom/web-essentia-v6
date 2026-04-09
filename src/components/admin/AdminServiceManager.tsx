import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp, FileText, Video, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  service_id: string;
}

interface Content {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  display_order: number;
  category_id: string;
}

interface ServiceInfo {
  id: string;
  name: string;
}

const CONTENT_TYPES = [
  { value: "video", label: "Vídeo" },
  { value: "pdf", label: "PDF" },
  { value: "zoom", label: "Zoom / Enlace en vivo" },
  { value: "link", label: "Enlace externo" },
];

const AdminServiceManager = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // New category form
  const [newCatService, setNewCatService] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  // Edit category
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");

  // New content form
  const [newContentCat, setNewContentCat] = useState<string | null>(null);
  const [newContentTitle, setNewContentTitle] = useState("");
  const [newContentDesc, setNewContentDesc] = useState("");
  const [newContentType, setNewContentType] = useState("video");
  const [newContentUrl, setNewContentUrl] = useState("");
  const [newContentThumb, setNewContentThumb] = useState("");

  // Edit content
  const [editContentId, setEditContentId] = useState<string | null>(null);
  const [editContentTitle, setEditContentTitle] = useState("");
  const [editContentDesc, setEditContentDesc] = useState("");
  const [editContentType, setEditContentType] = useState("video");
  const [editContentUrl, setEditContentUrl] = useState("");
  const [editContentThumb, setEditContentThumb] = useState("");

  const fetchAll = async () => {
    const [{ data: svcs }, { data: cats }, { data: conts }] = await Promise.all([
      supabase.from("services").select("id, name").order("display_order"),
      supabase.from("service_categories").select("*").order("display_order"),
      supabase.from("service_contents").select("*").order("display_order"),
    ]);
    setServices(svcs || []);
    setCategories(cats || []);
    setContents(conts || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // ---- CATEGORY CRUD ----
  const handleCreateCategory = async (serviceId: string) => {
    if (!newCatName.trim()) return;
    const maxOrder = categories.filter(c => c.service_id === serviceId).reduce((m, c) => Math.max(m, c.display_order), 0);
    await supabase.from("service_categories").insert({
      name: newCatName.trim(),
      description: newCatDesc || null,
      service_id: serviceId,
      display_order: maxOrder + 1,
    });
    toast({ title: "Categoría creada" });
    setNewCatService(null); setNewCatName(""); setNewCatDesc("");
    await fetchAll();
  };

  const handleUpdateCategory = async () => {
    if (!editCatId || !editCatName.trim()) return;
    await supabase.from("service_categories").update({
      name: editCatName.trim(),
      description: editCatDesc || null,
    }).eq("id", editCatId);
    toast({ title: "Categoría actualizada" });
    setEditCatId(null);
    await fetchAll();
  };

  const handleDeleteCategory = async (id: string) => {
    await supabase.from("service_contents").delete().eq("category_id", id);
    await supabase.from("service_categories").delete().eq("id", id);
    toast({ title: "Categoría eliminada" });
    await fetchAll();
  };

  const toggleCategoryActive = async (id: string, current: boolean) => {
    await supabase.from("service_categories").update({ is_active: !current }).eq("id", id);
    toast({ title: current ? "Categoría ocultada" : "Categoría visible" });
    await fetchAll();
  };

  // ---- CONTENT CRUD ----
  const handleCreateContent = async (categoryId: string) => {
    if (!newContentTitle.trim()) return;
    const maxOrder = contents.filter(c => c.category_id === categoryId).reduce((m, c) => Math.max(m, c.display_order), 0);
    await supabase.from("service_contents").insert({
      title: newContentTitle.trim(),
      description: newContentDesc || null,
      content_type: newContentType,
      url: newContentUrl,
      thumbnail_url: newContentThumb || null,
      category_id: categoryId,
      display_order: maxOrder + 1,
    });
    toast({ title: "Contenido creado" });
    setNewContentCat(null); setNewContentTitle(""); setNewContentDesc("");
    setNewContentType("video"); setNewContentUrl(""); setNewContentThumb("");
    await fetchAll();
  };

  const handleUpdateContent = async () => {
    if (!editContentId || !editContentTitle.trim()) return;
    await supabase.from("service_contents").update({
      title: editContentTitle.trim(),
      description: editContentDesc || null,
      content_type: editContentType,
      url: editContentUrl,
      thumbnail_url: editContentThumb || null,
    }).eq("id", editContentId);
    toast({ title: "Contenido actualizado" });
    setEditContentId(null);
    await fetchAll();
  };

  const handleDeleteContent = async (id: string) => {
    await supabase.from("service_contents").delete().eq("id", id);
    toast({ title: "Contenido eliminado" });
    await fetchAll();
  };

  const toggleContentActive = async (id: string, current: boolean) => {
    await supabase.from("service_contents").update({ is_active: !current }).eq("id", id);
    toast({ title: current ? "Contenido ocultado" : "Contenido visible" });
    await fetchAll();
  };

  const contentTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video size={14} />;
      case "pdf": return <FileText size={14} />;
      default: return <LinkIcon size={14} />;
    }
  };

  if (loading) return <div className="text-muted-foreground font-body py-8 text-center">Cargando...</div>;

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Gestión de Servicios</h2>
      <p className="text-muted-foreground font-body text-sm mb-6">
        Gestiona las categorías y contenidos de cada servicio. Los 3 servicios principales son fijos.
      </p>

      <div className="space-y-4">
        {services.map((svc) => {
          const svcCats = categories.filter(c => c.service_id === svc.id);
          const isExpanded = expandedService === svc.id;

          return (
            <div key={svc.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Service header */}
              <button
                onClick={() => setExpandedService(isExpanded ? null : svc.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors text-left"
              >
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{svc.name}</h3>
                  <p className="text-xs text-muted-foreground font-body">{svcCats.length} categoría(s)</p>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-3">
                      {/* Add category button */}
                      {newCatService !== svc.id ? (
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => { setNewCatService(svc.id); setNewCatName(""); setNewCatDesc(""); }}>
                          <Plus size={14} /> Nueva categoría
                        </Button>
                      ) : (
                        <div className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="font-body text-xs">Nombre *</Label>
                              <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nombre de categoría" className="mt-1" />
                            </div>
                            <div>
                              <Label className="font-body text-xs">Descripción</Label>
                              <Input value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} placeholder="Descripción breve" className="mt-1" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleCreateCategory(svc.id)}>Crear</Button>
                            <Button size="sm" variant="ghost" onClick={() => setNewCatService(null)}>Cancelar</Button>
                          </div>
                        </div>
                      )}

                      {/* Categories list */}
                      {svcCats.map((cat) => {
                        const catContents = contents.filter(c => c.category_id === cat.id);
                        const isCatExpanded = expandedCategory === cat.id;

                        return (
                          <div key={cat.id} className="border border-border rounded-xl overflow-hidden">
                            {editCatId === cat.id ? (
                              <div className="p-4 space-y-3 bg-muted/30">
                                <Input value={editCatName} onChange={e => setEditCatName(e.target.value)} placeholder="Nombre" />
                                <Input value={editCatDesc} onChange={e => setEditCatDesc(e.target.value)} placeholder="Descripción" />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleUpdateCategory}>Guardar</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditCatId(null)}>Cancelar</Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-3 p-3">
                                  <button
                                    onClick={() => setExpandedCategory(isCatExpanded ? null : cat.id)}
                                    className="flex-1 text-left flex items-center gap-2"
                                  >
                                    {isCatExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                                    <span className="font-body font-medium text-foreground text-sm">{cat.name}</span>
                                    <span className="text-xs text-muted-foreground">({catContents.length} contenidos)</span>
                                  </button>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => toggleCategoryActive(cat.id, cat.is_active)}
                                      className={`text-xs font-body px-2 py-1 rounded ${cat.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                                    >
                                      {cat.is_active ? "Visible" : "Oculta"}
                                    </button>
                                    <button onClick={() => { setEditCatId(cat.id); setEditCatName(cat.name); setEditCatDesc(cat.description || ""); }} className="text-muted-foreground hover:text-foreground p-1">
                                      <Pencil size={13} />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-muted-foreground hover:text-destructive p-1">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* Expanded category: contents */}
                                <AnimatePresence>
                                  {isCatExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-3 pb-3 space-y-2">
                                        {/* Add content button */}
                                        {newContentCat !== cat.id ? (
                                          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => { setNewContentCat(cat.id); setNewContentTitle(""); setNewContentDesc(""); setNewContentType("video"); setNewContentUrl(""); setNewContentThumb(""); }}>
                                            <Plus size={12} /> Añadir contenido
                                          </Button>
                                        ) : (
                                          <div className="bg-background rounded-lg p-3 space-y-2 border border-border">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                              <div>
                                                <Label className="font-body text-xs">Título *</Label>
                                                <Input value={newContentTitle} onChange={e => setNewContentTitle(e.target.value)} placeholder="Título" className="mt-1 text-sm" />
                                              </div>
                                              <div>
                                                <Label className="font-body text-xs">Tipo</Label>
                                                <select value={newContentType} onChange={e => setNewContentType(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-body">
                                                  {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                </select>
                                              </div>
                                            </div>
                                            <div>
                                              <Label className="font-body text-xs">URL</Label>
                                              <Input value={newContentUrl} onChange={e => setNewContentUrl(e.target.value)} placeholder="https://..." className="mt-1 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                              <div>
                                                <Label className="font-body text-xs">Descripción</Label>
                                                <Input value={newContentDesc} onChange={e => setNewContentDesc(e.target.value)} placeholder="Descripción" className="mt-1 text-sm" />
                                              </div>
                                              <div>
                                                <Label className="font-body text-xs">Thumbnail URL</Label>
                                                <Input value={newContentThumb} onChange={e => setNewContentThumb(e.target.value)} placeholder="https://..." className="mt-1 text-sm" />
                                              </div>
                                            </div>
                                            <div className="flex gap-2">
                                              <Button size="sm" onClick={() => handleCreateContent(cat.id)}>Crear</Button>
                                              <Button size="sm" variant="ghost" onClick={() => setNewContentCat(null)}>Cancelar</Button>
                                            </div>
                                          </div>
                                        )}

                                        {/* Contents list */}
                                        {catContents.map((content) => (
                                          editContentId === content.id ? (
                                            <div key={content.id} className="bg-background rounded-lg p-3 space-y-2 border border-border">
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div>
                                                  <Label className="font-body text-xs">Título *</Label>
                                                  <Input value={editContentTitle} onChange={e => setEditContentTitle(e.target.value)} className="mt-1 text-sm" />
                                                </div>
                                                <div>
                                                  <Label className="font-body text-xs">Tipo</Label>
                                                  <select value={editContentType} onChange={e => setEditContentType(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-body">
                                                    {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                  </select>
                                                </div>
                                              </div>
                                              <div>
                                                <Label className="font-body text-xs">URL</Label>
                                                <Input value={editContentUrl} onChange={e => setEditContentUrl(e.target.value)} className="mt-1 text-sm" />
                                              </div>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div>
                                                  <Label className="font-body text-xs">Descripción</Label>
                                                  <Input value={editContentDesc} onChange={e => setEditContentDesc(e.target.value)} className="mt-1 text-sm" />
                                                </div>
                                                <div>
                                                  <Label className="font-body text-xs">Thumbnail</Label>
                                                  <Input value={editContentThumb} onChange={e => setEditContentThumb(e.target.value)} className="mt-1 text-sm" />
                                                </div>
                                              </div>
                                              <div className="flex gap-2">
                                                <Button size="sm" onClick={handleUpdateContent}>Guardar</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditContentId(null)}>Cancelar</Button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div key={content.id} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border">
                                              <span className="text-primary shrink-0">{contentTypeIcon(content.content_type)}</span>
                                              <div className="flex-1 min-w-0">
                                                <p className="font-body text-xs font-medium text-foreground truncate">{content.title}</p>
                                                {content.description && <p className="font-body text-xs text-muted-foreground truncate">{content.description}</p>}
                                              </div>
                                              <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                  onClick={() => toggleContentActive(content.id, content.is_active)}
                                                  className={`text-xs font-body px-1.5 py-0.5 rounded ${content.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                                                >
                                                  {content.is_active ? "✓" : "✗"}
                                                </button>
                                                <button onClick={() => { setEditContentId(content.id); setEditContentTitle(content.title); setEditContentDesc(content.description || ""); setEditContentType(content.content_type); setEditContentUrl(content.url); setEditContentThumb(content.thumbnail_url || ""); }} className="text-muted-foreground hover:text-foreground p-1">
                                                  <Pencil size={12} />
                                                </button>
                                                <button onClick={() => handleDeleteContent(content.id)} className="text-muted-foreground hover:text-destructive p-1">
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
                                            </div>
                                          )
                                        ))}
                                        {catContents.length === 0 && newContentCat !== cat.id && (
                                          <p className="text-xs text-muted-foreground font-body py-2 text-center">Sin contenidos</p>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </>
                            )}
                          </div>
                        );
                      })}

                      {svcCats.length === 0 && (
                        <p className="text-sm text-muted-foreground font-body text-center py-4">No hay categorías</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminServiceManager;
