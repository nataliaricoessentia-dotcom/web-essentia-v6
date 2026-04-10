import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import clasesLogo from "@/assets/clases-essentia-logo.png";
import programasLogo from "@/assets/programas-essentia-logo.png";
import metodoLogo from "@/assets/metodo-essentia-logo.png";

const WHATSAPP_NUMBER = "34666359421";

const getServiceImage = (serviceName: string) => {
  const normalized = serviceName.trim().toLowerCase();

  if (normalized === "clases") return clasesLogo;

  if (normalized === "cursos" || normalized === "programas de bienestar") {
    return programasLogo;
  }

  if (normalized === "método essentia" || normalized === "metodo essentia") {
    return metodoLogo;
  }

  return "";
};

const serviceWhatsapp: Record<string, string> = {
  Clases: "Hola Natalia, estoy interesada en la clase de",
  Cursos: "Hola Natalia, estoy interesada en el curso",
  "Método Essentia": "Hola Natalia, me gustaría saber más sobre el Método Essentia",
  "Programas de bienestar": "Hola Natalia, estoy interesada en el programa",
};

const serviceSubtitles: Record<string, string> = {
  Clases: "Fascia yoga · Respiración funcional · Regulación sistema nervioso",
  Cursos: "Programas específicos · Favorece tu vitalidad",
  "Método Essentia": "Proceso individual personalizado · Transformación desde el origen",
  "Programas de bienestar": "Programas específicos · Favorece tu vitalidad",
};

const serviceBtnLabels: Record<string, string> = {
  Clases: "Ver clases",
  Cursos: "Ver cursos",
  "Método Essentia": "Descubrir el método",
  "Programas de bienestar": "Ver programas",
};

interface CategoryItem {
  id: string;
  name: string;
  description: string | null;
}

interface ServiceWithCats {
  id: string;
  name: string;
  description: string | null;
  categories: CategoryItem[];
}

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [expanded, setExpanded] = useState<number | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceWithCats[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: svcs } = await supabase
        .from("services")
        .select("id, name, description")
        .eq("is_active", true)
        .order("display_order");

      const { data: cats } = await supabase
        .from("service_categories")
        .select("id, name, description, service_id")
        .eq("is_active", true)
        .order("display_order");

      const result: ServiceWithCats[] = (svcs || []).map((s) => ({
        ...s,
        categories: (cats || []).filter((c) => c.service_id === s.id),
      }));
      setServices(result);
    };
    load();
  }, []);

  return (
    <section id="servicios" className="py-24 bg-muted">
      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Servicios</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Elige la forma de empezar
          </h2>
          <p className="text-foreground/70 font-body max-w-2xl mx-auto text-lg">
            Según tu momento y tus necesidades. Desde clases prácticas para incorporar herramientas en tu día a día hasta procesos completos de transformación desde el origen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {services.map((s, i) => {
            const isMetodo = s.name === "Método Essentia";
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 * i }}
                className="bg-card rounded-2xl overflow-hidden text-center group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
              >
                <div className="w-full aspect-[4/3] overflow-hidden">
                  <img
                    src={getServiceImage(s.name)}
                    alt={s.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-1">{s.name}</h3>

                  <p className="font-body text-sm text-foreground/60 mb-6">
                    {serviceSubtitles[s.name] || s.description || ""}
                  </p>

                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-olive-dark transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    {serviceBtnLabels[s.name] || "Ver más"}
                    {expanded === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 text-left overflow-hidden"
                      >
                        {isMetodo ? (
                          <>
                            <p className="font-body text-sm text-foreground/70 leading-relaxed mb-6">
                              Un proceso individualizado y completamente adaptado a ti, enfocado en recuperar la funcionalidad natural de tu organismo desde un enfoque integral. A través de un análisis profundo de tu situación, trabajamos sobre hábitos, alimentación, sistema nervioso, respiración, movimiento y entorno. Es para ti si buscas un cambio real, personalizado y sostenido en el tiempo.
                            </p>

                            <a
                              href="https://calendly.com/nataliaessentia"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium text-center hover:opacity-90 transition-opacity"
                            >
                              Agendar sesión gratuita
                            </a>
                          </>
                        ) : s.categories.length > 0 ? (
                          <div className="space-y-2">
                            {s.categories.map((cat) => (
                              <div key={cat.id} className="border border-border rounded-lg overflow-hidden">
                                <button
                                  onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                                >
                                  <span className="font-body font-medium text-foreground text-sm flex-1">
                                    {cat.name}
                                  </span>
                                  {expandedCat === cat.id ? (
                                    <ChevronUp size={14} className="text-muted-foreground" />
                                  ) : (
                                    <ChevronDown size={14} className="text-muted-foreground" />
                                  )}
                                </button>

                                <AnimatePresence>
                                  {expandedCat === cat.id && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-3 pb-3 space-y-3">
                                        {cat.description && (
                                          <p className="font-body text-sm text-foreground/70 leading-relaxed">
                                            {cat.description}
                                          </p>
                                        )}

                                        <a
                                          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`${serviceWhatsapp[s.name] || "Hola Natalia, estoy interesada en"} ${cat.name}`)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center justify-center gap-2 w-full bg-secondary text-secondary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                                        >
                                          <MessageCircle size={16} />
                                          ¡Quiero apuntarme!
                                        </a>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="font-body text-sm text-muted-foreground text-center py-4">
                            Próximamente
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center font-display text-lg italic text-primary mt-16"
        >
          No importa desde dónde empieces, lo importante es dar el paso hacia una mejor calidad de vida.
        </motion.p>
      </div>
    </section>
  );
};

export default ServicesSection;