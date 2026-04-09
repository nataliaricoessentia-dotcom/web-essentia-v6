import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X } from "lucide-react";

const forYou = [
  "Entiendes que no existen soluciones rápidas: el cambio real requiere constancia.",
  "Estás cansada de diagnósticos que solo parchean sin abordar el origen.",
  "Intuyes que lo que te ocurre tiene una raíz, y quieres comprenderla.",
  "Sientes que tu cuerpo te está pidiendo un cambio.",
  "Quieres volver a sentirte bien: con energía, sin dolor, con libertad.",
  "Buscas un acompañamiento cercano de alguien que también ha pasado por ese proceso.",
];

const notForYou = [
  "Buscas soluciones rápidas sin implicarte en el proceso.",
  "Prefieres seguir poniendo excusas antes que generar cambios reales.",
  "Buscas únicamente aliviar síntomas sin profundizar en el origen.",
  "Necesitas resultados inmediatos y te frustras si el proceso requiere tiempo.",
];

const ForYouSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-background">
      <div ref={ref} className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Descubre</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            ¿Es para ti?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* For you */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h3 className="font-display text-xl font-semibold text-primary mb-6">Sí, es para ti si…</h3>
            <ul className="space-y-4">
              {forYou.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-body text-foreground/80 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Not for you */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <h3 className="font-display text-xl font-semibold text-foreground/50 mb-6">No es para ti si…</h3>
            <ul className="space-y-4">
              {notForYou.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-foreground/40" />
                  </div>
                  <span className="font-body text-foreground/50 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ForYouSection;
