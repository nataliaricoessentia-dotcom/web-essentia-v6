import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CtaSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-background">
      <div ref={ref} className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Si has llegado hasta aquí, tu compromiso con encontrar el origen es más fuerte que parchear los síntomas
          </h2>
          <p className="font-body text-foreground/70 text-lg mb-10">
            Empieza a reconectar contigo y favorecer tu bienestar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/34666359421?text=Hola%20Natalia%2C%20quiero%20empezar%20mi%20proceso%20de%20bienestar"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-medium hover:bg-olive-dark transition-colors"
            >
              Quiero empezar
            </a>
            <a
              href="#servicios"
              className="border border-primary text-primary px-8 py-3.5 rounded-lg font-medium hover:bg-primary/5 transition-colors"
            >
              Ver servicios
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
