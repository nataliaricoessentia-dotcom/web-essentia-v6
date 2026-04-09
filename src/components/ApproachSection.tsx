import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Leaf, Clock, Wind, Brain, Apple, Sparkles, Clover } from "lucide-react";
import yogaIcon from "@/assets/yoga-icon.png";

const blocks = [
  { icon: Sparkles, title: "Funcionalidad orgánica", desc: "Apoyo al correcto funcionamiento de los sistemas del organismo." },
  { icon: Brain, title: "Sistema nervioso", desc: "Regulación del estrés, la ansiedad y los estados de alerta." },
  { icon: Clover, title: "Hábitos saludables", desc: "Incorporación de rutinas y prácticas que favorecen el bienestar diario de forma sostenible." },
  { icon: Clock, title: "Ritmos biológicos", desc: "Recuperación del sueño reparador y la energía." },
  { icon: Apple, title: "Alimentación natural", desc: "Nutrición consciente basada en alimentos reales y herramientas naturales." },
  { customIcon: yogaIcon, title: "Fascia yoga", desc: "Trabajo corporal para la ganancia de movilidad, liberación de tensiones y mejora de la comunicación celular." },
  { icon: Leaf, title: "Entorno y tóxicos", desc: "Reducción de la exposición a tóxicos ambientales y optimización del entorno." },
  { icon: Wind, title: "Respiración diafragmática", desc: "Mejora de la función respiratoria y autorregulación del sistema nervioso." },
];

const ApproachSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-background">
      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Mi enfoque</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Un enfoque integral para transformar tu bienestar desde el origen
          </h2>
          <p className="text-foreground/70 font-body max-w-2xl mx-auto text-lg">
            No se trata de parchear síntomas, sino de comprender qué está ocurriendo en tu organismo y acompañarte a recuperar su funcionalidad natural.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {blocks.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              className="bg-muted rounded-xl p-6 text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                {b.customIcon ? (
                  <img src={b.customIcon} alt={b.title} className="w-9 h-9 object-contain" style={{ filter: 'sepia(1) saturate(0.5) hue-rotate(70deg) brightness(0.7)' }} />
                ) : (
                  <b.icon className="w-6 h-6 text-primary" />
                )}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{b.title}</h3>
              <p className="font-body text-sm text-foreground/70">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ApproachSection;
