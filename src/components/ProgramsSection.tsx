import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Program {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

const WHATSAPP_NUMBER = "34666359421";

const ProgramsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("programs")
      .select("id, title, description, image_url")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setPrograms(data || []));
  }, []);

  if (programs.length === 0) return null;

  return (
    <section id="cursos" className="py-24 bg-background">
      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Formación</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Cursos Essentia
          </h2>
          <p className="text-foreground/70 font-body max-w-2xl mx-auto text-lg">
            Cursos diseñados para acompañarte en un proceso de cambio profundo y duradero.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-3">
          {programs.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                    <span className="text-muted-foreground">📷</span>
                  </div>
                )}
                <span className="font-display text-lg font-semibold text-foreground flex-1">{p.title}</span>
                {expandedId === p.id ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {expandedId === p.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4">
                      {p.description && (
                        <p className="font-body text-sm text-foreground/70 leading-relaxed">{p.description}</p>
                      )}
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, estoy interesada en el curso ${p.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                      >
                        <MessageCircle size={18} />
                        ¡Quiero apuntarme!
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
