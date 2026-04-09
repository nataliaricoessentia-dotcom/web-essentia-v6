import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
}

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "100px" });
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, name, role, text")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setTestimonials(data || []));
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Testimonios</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            Experiencias reales de transformación
          </h2>
        </motion.div>

        <div className={`grid grid-cols-1 ${testimonials.length >= 3 ? "md:grid-cols-3" : testimonials.length === 2 ? "md:grid-cols-2" : "max-w-2xl mx-auto"} gap-8`}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.6, delay: 0.15 * i }}
              className="bg-muted rounded-2xl p-8 relative"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
              <p className="font-body text-foreground/80 leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <div>
                <p className="font-display font-semibold text-foreground">{t.name}</p>
                <p className="font-body text-sm text-foreground/50">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
