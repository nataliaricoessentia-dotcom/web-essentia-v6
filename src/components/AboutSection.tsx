import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import nataliaAbout from "@/assets/natalia-about.jpg";

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="sobre-mi" className="py-24 bg-muted">
      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <img
              src={nataliaAbout}
              alt="Natalia, terapeuta y bióloga"
              className="rounded-2xl shadow-lg w-full max-w-sm object-cover aspect-square"
              width={400}
              height={400}
            />
          </motion.div>

          {/* Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Sobre mí</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-8">
                Del dolor cronificado a una vida funcional
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-5 text-foreground/80 font-body leading-relaxed md:text-lg text-justify"
            >
              <p>
                Mi nombre es Natalia y, durante años, conviví con endometriosis y los desafíos que esto supone en el día a día.
              </p>
              <p>
                Lo que comenzó como una regla irregular evolucionó hasta convertirse en dolor crónico que limitaba mi vida física, mental y emocional. Descubrí que la solución no estaba en tratar los síntomas, sino en entender desde una perspectiva integral lo que los estaba provocando.
              </p>
              <p>
                Gracias a este enfoque, no solo recuperé mi bienestar: transformé mi vida.
              </p>
              <p className="text-primary font-display text-xl italic">
                "Yo estuve ahí y sé cómo ayudarte"
              </p>

              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-primary font-medium hover:underline transition-all"
              >
                {expanded ? "Cerrar" : "Conóceme más"}
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-5"
                  >
                    <p>
                      Mi nombre es Natalia y, durante años, conviví con endometriosis y los desafíos que esto supone en el día a día.
                    </p>
                    <p>
                      Lo que comenzó como una regla irregular evolucionó hasta convertirse en dolor crónico que limitaba mi vida física, mental y emocional. Esta situación no solo me afectaba en el plano físico, sino también a nivel mental y emocional.
                    </p>
                    <p>
                      Cuando finalmente recibí el diagnóstico y pregunté por la causa, la respuesta fue clara: <em className="text-primary font-medium">"Eso es lo de menos, con anticonceptivos desaparecerá el dolor"</em>. En ese momento entendí que se me ofrecía una solución centrada en silenciar síntomas, no en sanar la raíz.
                    </p>
                    <p>
                      Ese fue el inicio de una búsqueda hacia el origen de mi condición, que me llevó a adoptar un abordaje integrativo: revisar la exposición a tóxicos, modular la alimentación, mejorar hábitos, trabajar la respiración y la regulación del sistema nervioso, y abordar tensiones corporales acumuladas, especialmente en la zona pélvica.
                    </p>
                    <p>
                      En mi caso, ese camino cambió mi vida. Hoy hago vida normal y acompaño a otras mujeres en este mismo viaje de transformación hacia la vitalidad y funcionalidad que merecen. Desde un lugar muy honesto: no desde una promesa, sino desde la experiencia y el deseo de acercar información que favorezca la calidad de vida de mujeres que padecen esta situación.
                    </p>
                    <p>
                      Soy bióloga y terapeuta especializada en acompañar procesos de recuperación de la función natural del organismo. Estoy formada en fitoterapia, alimentación ayurvédica, funcionalidad orgánica y regulación del sistema nervioso, fascia yoga y respiración funcional.
                    </p>
                    <p className="text-primary font-display text-xl italic">
                      "Yo estuve ahí y sé cómo ayudarte"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
