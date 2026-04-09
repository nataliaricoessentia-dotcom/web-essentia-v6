import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSectionVisibility } from "@/hooks/useSectionVisibility";

const allNavLinks = [
  { label: "Inicio", href: "#hero" },
  { label: "Sobre mí", href: "#sobre-mi" },
  { label: "Servicios", href: "#servicios" },
  { label: "¿Es para ti?", href: "#es-para-ti" },
  { label: "Recursos", href: "#recursos", sectionKey: "resources" },
  { label: "Productos", href: "#productos", sectionKey: "products" },
  { label: "Testimonios", href: "#testimonios", sectionKey: "testimonials" },
  { label: "Contacto", href: "#contacto" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { visibility, loaded } = useSectionVisibility();

  const navLinks = allNavLinks.filter((l) => {
    if (!l.sectionKey) return true;
    if (!loaded) return true;
    return visibility[l.sectionKey] !== false;
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <a href="#hero" className="text-xl tracking-wide text-primary italic font-display">
          Natalia Essentia
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-body tracking-wide text-foreground/80 hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/login"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-olive-dark transition-colors"
          >
            Login
          </a>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-body text-foreground/80 hover:text-primary transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/login"
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium text-center"
              >
                Login
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
