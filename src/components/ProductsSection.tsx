import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ExternalLink, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  purchase_url: string;
  discount_code: string;
}

const ProductsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, description, image_url, purchase_url, discount_code")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setProducts(data || []));
  }, []);

  return (
    <section id="productos" className="py-24 bg-muted">
      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Recomendados</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Productos
          </h2>
          <p className="text-foreground/70 font-body max-w-2xl mx-auto">
            Aquí encontrarás productos recomendados para mejorar tu bienestar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * i }}
              className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {p.image_url && (
                <div className="w-full aspect-square overflow-hidden">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{p.name}</h3>
                <p className="font-body text-sm text-foreground/70 leading-relaxed mb-4 flex-1">
                  {p.description}
                </p>
                {p.discount_code && (
                  <div className="flex items-center gap-2 mb-4 bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-body">
                    <Tag size={14} />
                    <span>Código: <strong>{p.discount_code}</strong></span>
                  </div>
                )}
                {p.purchase_url && (
                  <a
                    href={p.purchase_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink size={16} />
                    Ver producto
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
