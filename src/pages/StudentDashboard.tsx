import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, ChevronDown, ChevronRight, Play, FileText, Video, Link as LinkIcon, ExternalLink, Lock, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clasesLogo from "@/assets/clases-essentia-logo.png";
import programasLogo from "@/assets/programas-essentia-logo.png";
import metodoLogo from "@/assets/metodo-essentia-con-fondo.png";
import fasciaYogaLogo from "@/assets/fascia-yoga-logo.png";
import endoesenciaLogo from "@/assets/endoesencia-logo.png";

const serviceImages: Record<string, string> = {
  "Clases": clasesLogo,
  "Cursos": programasLogo,
  "Método Essentia": metodoLogo,
};

const categoryImages: Record<string, string> = {
  "Fascia Yoga": fasciaYogaLogo,
  "EndoEssentia": endoesenciaLogo,
};

interface ServiceContent {
  id: string;
  title: string;
  description: string;
  content_type: string;
  url: string;
  display_order: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  display_order: number;
  contents: ServiceContent[];
  hasAccess: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  display_order: number;
  categories: Category[];
}

const contentTypeIcon = (type: string) => {
  switch (type) {
    case "video": return <Play size={16} />;
    case "zoom": return <Video size={16} />;
    case "pdf": return <FileText size={16} />;
    default: return <LinkIcon size={16} />;
  }
};

const StudentDashboard = () => {
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .maybeSingle();
        setProfile(profileData);

        // Fetch student's active access entries
        const { data: studentServices } = await supabase
          .from("student_services")
          .select("service_id, category_id")
          .eq("user_id", user.id)
          .eq("is_active", true);

        // Fetch ALL active services
        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("display_order");

        if (!servicesData) {
          setLoading(false);
          return;
        }

        const enriched: Service[] = [];
        for (const svc of servicesData) {
          const svcAccess = (studentServices || []).filter((ss) => ss.service_id === svc.id);
          const hasFullAccess = svcAccess.some((ss) => !ss.category_id);
          const accessibleCatIds = new Set(svcAccess.map((ss) => ss.category_id).filter(Boolean));

          // Fetch ALL active categories for this service
          const { data: categories } = await supabase
            .from("service_categories")
            .select("*")
            .eq("service_id", svc.id)
            .eq("is_active", true)
            .order("display_order");

          const catsWithContent: Category[] = [];
          for (const cat of categories || []) {
            const catHasAccess = hasFullAccess || accessibleCatIds.has(cat.id);

            let contents: ServiceContent[] = [];
            if (catHasAccess) {
              const { data: contentsData } = await supabase
                .from("service_contents")
                .select("*")
                .eq("category_id", cat.id)
                .eq("is_active", true)
                .order("display_order");
              contents = contentsData || [];
            }

            catsWithContent.push({ ...cat, contents, hasAccess: catHasAccess });
          }

          enriched.push({ ...svc, categories: catsWithContent });
        }

        setServices(enriched);
      } catch (err) {
        console.error("Error fetching student data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-body">Cargando...</div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Alumna";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
          <a href="/" className="text-xl font-semibold text-primary italic">
            <span className="font-display">Natalia</span>{" "}
            <span className="font-display">Essentia</span>
          </a>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="text-sm font-body text-primary hover:underline"
              >
                Panel Admin
              </button>
            )}
            <span className="text-sm font-body text-foreground/70 hidden sm:inline">
              Hola, {displayName}
            </span>
            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
          Tu espacio de bienestar
        </h1>
        <p className="text-muted-foreground font-body mb-10">
          Aquí encontrarás todo el contenido de tus servicios activos.
        </p>

        <div className="space-y-6">
          {services.map((svc) => (
            <div key={svc.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Service header with large image */}
              <button
                onClick={() => setExpandedService(expandedService === svc.id ? null : svc.id)}
                className="w-full flex items-center gap-5 p-5 text-left hover:bg-muted/50 cursor-pointer transition-colors"
              >
                {serviceImages[svc.name] && (
                  <img
                    src={serviceImages[svc.name]}
                    alt={svc.name}
                    className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-sm"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-xl font-semibold text-foreground">{svc.name}</h2>
                  <p className="text-sm text-muted-foreground font-body mt-1">{svc.description}</p>
                </div>
                <ChevronDown
                  size={22}
                  className={`text-muted-foreground transition-transform shrink-0 ${expandedService === svc.id ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {expandedService === svc.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-3">
                      {svc.categories.map((cat) => (
                        <div
                          key={cat.id}
                          className={`rounded-xl overflow-hidden border ${cat.hasAccess ? "bg-muted/40 border-border" : "bg-muted/20 border-border/50 opacity-75"}`}
                        >
                          <button
                            onClick={() => {
                              if (cat.hasAccess) {
                                setExpandedCategory(expandedCategory === cat.id ? null : cat.id);
                              }
                            }}
                            className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${cat.hasAccess ? "hover:bg-muted cursor-pointer" : "cursor-default"}`}
                          >
                            {categoryImages[cat.name] && (
                              <img
                                src={categoryImages[cat.name]}
                                alt={cat.name}
                                className="w-14 h-14 rounded-xl object-cover shrink-0"
                              />
                            )}
                            <span className="font-body font-medium text-foreground flex-1">{cat.name}</span>
                            {cat.hasAccess ? (
                              <ChevronRight
                                size={18}
                                className={`text-muted-foreground transition-transform shrink-0 ${expandedCategory === cat.id ? "rotate-90" : ""}`}
                              />
                            ) : (
                              <Lock size={18} className="text-muted-foreground shrink-0" />
                            )}
                          </button>

                          {/* WhatsApp CTA for locked categories */}
                          {!cat.hasAccess && (
                            <div className="px-4 pb-4">
                              <a
                                href={`https://wa.me/34666359421?text=${encodeURIComponent(`Hola Natalia, me gustaría contratar: ${cat.name} (${svc.name})`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                              >
                                <MessageCircle size={16} />
                                Contratar
                              </a>
                            </div>
                          )}

                          {/* Content list for unlocked categories */}
                          <AnimatePresence>
                            {expandedCategory === cat.id && cat.hasAccess && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-2">
                                  {cat.contents.length === 0 ? (
                                    <p className="text-sm text-muted-foreground font-body py-2">
                                      Contenido próximamente...
                                    </p>
                                  ) : (
                                    cat.contents.map((content) => (
                                      <a
                                        key={content.id}
                                        href={content.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-background transition-colors group border border-border"
                                      >
                                        <span className="text-primary">{contentTypeIcon(content.content_type)}</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-body text-sm font-medium text-foreground truncate">
                                            {content.title}
                                          </p>
                                          {content.description && (
                                            <p className="font-body text-xs text-muted-foreground truncate">
                                              {content.description}
                                            </p>
                                          )}
                                        </div>
                                        <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                      </a>
                                    ))
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
