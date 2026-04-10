import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users, BookOpen, ArrowLeft, Check, X as XIcon, ChevronDown,
  UserPlus, Quote, ShoppingBag, Layout, Mail, Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminTestimonials from "@/components/admin/AdminTestimonials";
import AdminResources from "@/components/admin/AdminResources";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminSections from "@/components/admin/AdminSections";
import AdminLeads from "@/components/admin/AdminLeads";
import AdminServiceManager from "@/components/admin/AdminServiceManager";

interface StudentRow {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  services: { service_name: string; category_name: string | null; is_active: boolean }[];
}

interface ServiceRow {
  id: string;
  name: string;
  categories: { id: string; name: string; is_active: boolean }[];
}

type TabType = "students" | "services" | "products" | "testimonials" | "resources" | "sections" | "leads";

const AdminPanel = () => {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabType>("students");

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [servicesData, setServicesData] = useState<ServiceRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const [showNewStudent, setShowNewStudent] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creatingStudent, setCreatingStudent] = useState(false);

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingStudent, setSavingStudent] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/login");
  }, [user, authLoading, isAdmin, navigate]);

  const fetchStudents = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: allStudentServices } = await supabase
      .from("student_services")
      .select("user_id, service_id, category_id, is_active");
    const { data: services } = await supabase.from("services").select("id, name");
    const { data: categories } = await supabase.from("service_categories").select("id, name");

    const svcMap = new Map(services?.map((s) => [s.id, s.name]) || []);
    const catMap = new Map(categories?.map((c) => [c.id, c.name]) || []);

    const rows: StudentRow[] = (profiles || []).map((p) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      email: p.email,
      phone: p.phone || "",
      services: (allStudentServices || [])
        .filter((ss) => ss.user_id === p.user_id)
        .map((ss) => ({
          service_name: svcMap.get(ss.service_id) || "—",
          category_name: ss.category_id ? catMap.get(ss.category_id) || null : null,
          is_active: ss.is_active,
        })),
    }));
    setStudents(rows);
  };

  const fetchServices = async () => {
    const { data: svcs } = await supabase.from("services").select("id, name").order("display_order");
    const { data: cats } = await supabase
      .from("service_categories")
      .select("id, name, service_id, is_active")
      .order("display_order");

    const rows: ServiceRow[] = (svcs || []).map((s) => ({
      ...s,
      categories: (cats || []).filter((c) => c.service_id === s.id),
    }));
    setServicesData(rows);
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    Promise.all([fetchStudents(), fetchServices()]).then(() => setLoadingData(false));
  }, [user, isAdmin]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setCreatingStudent(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user-v2", {
        body: { email: newEmail, full_name: newName, phone: newPhone },
      });

      if (error) {
        toast({ title: "Error al crear alumna", description: error.message, variant: "destructive" });
        setCreatingStudent(false);
        return;
      }

      if (data?.error) {
        toast({ title: "Error al crear alumna", description: data.error, variant: "destructive" });
        setCreatingStudent(false);
        return;
      }

      if (data?.email_sent) {
        toast({
          title: "Alumna creada ✓",
          description: `Cuenta creada para ${newEmail}. Se ha enviado el email para establecer contraseña.`,
        });
      } else {
        toast({
          title: "Alumna creada (email pendiente)",
          description: `Cuenta creada para ${newEmail}, pero no se pudo enviar el email${data?.email_error ? `: ${data.email_error}` : ""}.`,
          variant: "destructive",
        });
      }

      setNewEmail("");
      setNewName("");
      setNewPhone("");
      setShowNewStudent(false);
      await fetchStudents();
    } catch (err: any) {
      toast({
        title: "Error de conexión",
        description: err?.message || "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    }
    setCreatingStudent(false);
  };

  const startEditStudent = (st: StudentRow) => {
    setEditingStudentId(st.user_id);
    setEditName(st.full_name || "");
    setEditEmail(st.email || "");
    setEditPhone(st.phone || "");
  };

  const cancelEditStudent = () => {
    setEditingStudentId(null);
    setEditName("");
    setEditEmail("");
    setEditPhone("");
  };

  const handleSaveStudent = async () => {
    if (!editingStudentId) return;
    setSavingStudent(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-update-user-v2", {
        body: {
          user_id: editingStudentId,
          full_name: editName,
          email: editEmail,
          phone: editPhone,
        },
      });

      if (error || data?.error) {
        toast({
          title: "Error al actualizar alumna",
          description: error?.message || data?.error || "No se pudo actualizar",
          variant: "destructive",
        });
        setSavingStudent(false);
        return;
      }

      toast({ title: "Alumna actualizada ✓" });
      cancelEditStudent();
      await fetchStudents();
    } catch (err: any) {
      toast({
        title: "Error de conexión",
        description: err?.message || "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    }

    setSavingStudent(false);
  };

  const handleDeleteStudent = async (userId: string, email: string) => {
    const ok = window.confirm(`¿Seguro que quieres eliminar a ${email}? Esta acción la borrará de Auth y de las tablas relacionadas.`);
    if (!ok) return;

    setDeletingStudent(userId);

    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-user-v2", {
        body: { user_id: userId },
      });

      if (error || data?.error) {
        toast({
          title: "Error al eliminar alumna",
          description: error?.message || data?.error || "No se pudo eliminar",
          variant: "destructive",
        });
        setDeletingStudent(null);
        return;
      }

      toast({ title: "Alumna eliminada ✓" });
      await fetchStudents();
    } catch (err: any) {
      toast({
        title: "Error de conexión",
        description: err?.message || "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    }

    setDeletingStudent(null);
  };

  const toggleStudentService = async (userId: string, serviceId: string, categoryId: string | null, currentlyActive: boolean) => {
    if (currentlyActive) {
      await supabase
        .from("student_services")
        .update({ is_active: false })
        .eq("user_id", userId)
        .eq("service_id", serviceId)
        .eq("category_id", categoryId || "");
    } else {
      let query = supabase
        .from("student_services")
        .select("id")
        .eq("user_id", userId)
        .eq("service_id", serviceId);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      } else {
        query = query.is("category_id", null);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        await supabase.from("student_services").update({ is_active: true }).eq("id", existing.id);
      } else {
        await supabase.from("student_services").insert({
          user_id: userId,
          service_id: serviceId,
          category_id: categoryId,
        });
      }
    }

    await fetchStudents();
    toast({ title: "Acceso actualizado" });
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-body">Cargando...</div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "students", label: "Alumnas", icon: <Users size={16} /> },
    { key: "services", label: "Servicios", icon: <BookOpen size={16} /> },
    { key: "products", label: "Productos", icon: <ShoppingBag size={16} /> },
    { key: "testimonials", label: "Testimonios", icon: <Quote size={16} /> },
    { key: "resources", label: "Recursos", icon: <Video size={16} /> },
    { key: "leads", label: "Leads", icon: <Mail size={16} /> },
    { key: "sections", label: "Secciones", icon: <Layout size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/alumno")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={18} />
            </button>
            <span className="font-display text-lg font-semibold text-foreground">Panel Admin</span>
          </div>
          <button
            onClick={async () => { await signOut(); navigate("/login"); }}
            className="text-sm text-muted-foreground hover:text-foreground font-body"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm transition-colors ${
                tab === t.key ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border hover:bg-muted"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "students" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold text-foreground">Gestión de alumnas</h2>
              <Button onClick={() => setShowNewStudent(!showNewStudent)} size="sm" className="gap-2">
                <UserPlus size={16} /> Nueva alumna
              </Button>
            </div>

            <AnimatePresence>
              {showNewStudent && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <form onSubmit={handleCreateStudent} className="bg-card rounded-2xl p-6 border border-border mb-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-body">Nombre</Label>
                        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre completo" className="mt-1" />
                      </div>
                      <div>
                        <Label className="font-body">Email *</Label>
                        <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" placeholder="email@ejemplo.com" required className="mt-1" />
                      </div>
                      <div>
                        <Label className="font-body">Teléfono</Label>
                        <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+34..." className="mt-1" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-body">
                      La alumna recibirá un email para establecer su propia contraseña.
                    </p>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={creatingStudent} size="sm">
                        {creatingStudent ? "Creando..." : "Crear alumna"}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewStudent(false)}>Cancelar</Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {students.map((st) => (
                <div key={st.user_id} className="bg-card rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedStudent(expandedStudent === st.user_id ? null : st.user_id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-body font-medium text-foreground">{st.full_name || st.email}</p>
                      <p className="text-sm text-muted-foreground font-body">{st.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-body bg-muted px-2 py-1 rounded text-muted-foreground">
                        {st.services.filter((s) => s.is_active).length} activos
                      </span>
                      <ChevronDown size={16} className={`text-muted-foreground transition-transform ${expandedStudent === st.user_id ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedStudent === st.user_id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4">
                          <div className="mb-4 space-y-3">
                            {editingStudentId === st.user_id ? (
                              <>
                                <div>
                                  <Label className="font-body">Nombre</Label>
                                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                  <Label className="font-body">Email</Label>
                                  <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} type="email" className="mt-1" />
                                </div>
                                <div>
                                  <Label className="font-body">Teléfono</Label>
                                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="mt-1" />
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleSaveStudent} disabled={savingStudent}>
                                    {savingStudent ? "Guardando..." : "Guardar cambios"}
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={cancelEditStudent}>
                                    Cancelar
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => startEditStudent(st)}>
                                  Editar datos
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteStudent(st.user_id, st.email)}
                                  disabled={deletingStudent === st.user_id}
                                >
                                  {deletingStudent === st.user_id ? "Eliminando..." : "Eliminar alumna"}
                                </Button>
                              </div>
                            )}
                          </div>

                          {st.phone && <p className="text-sm text-muted-foreground font-body mb-3">📱 {st.phone}</p>}

                          <p className="text-sm font-body font-medium text-foreground mb-2">Gestionar acceso:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {servicesData.map((svc) =>
                              svc.categories.map((cat) => {
                                const active = st.services.some(
                                  (ss) => ss.service_name === svc.name && ss.category_name === cat.name && ss.is_active
                                );

                                return (
                                  <button
                                    key={`${svc.id}-${cat.id}`}
                                    onClick={() => toggleStudentService(st.user_id, svc.id, cat.id, active)}
                                    className={`flex items-center gap-2 p-2 rounded-lg text-sm font-body transition-colors text-left ${
                                      active
                                        ? "bg-primary/10 text-primary border border-primary/30"
                                        : "bg-muted text-muted-foreground border border-transparent hover:border-border"
                                    }`}
                                  >
                                    {active ? <Check size={14} /> : <XIcon size={14} />}
                                    <span>{svc.name} → {cat.name}</span>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-center text-muted-foreground font-body py-8">No hay alumnas registradas</p>
              )}
            </div>
          </div>
        )}

        {tab === "services" && <AdminServiceManager />}
        {tab === "products" && <AdminProducts />}
        {tab === "testimonials" && <AdminTestimonials />}
        {tab === "resources" && <AdminResources />}
        {tab === "leads" && <AdminLeads />}
        {tab === "sections" && <AdminSections />}
      </main>
    </div>
  );
};

export default AdminPanel;