import { Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contacto" className="py-16 bg-muted border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              <span className="font-display">Natalia</span>{" "}
              <span className="font-display">Essentia</span>
            </h3>
            <p className="font-body text-foreground/60 text-sm leading-relaxed">
              Reconecta con la naturaleza funcional de tu cuerpo. Bienestar integral desde el origen.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-body text-sm tracking-widest uppercase text-foreground/40 mb-4">Navegación</h4>
            <div className="flex flex-col gap-2">
              {["Inicio", "Sobre mí", "Servicios", "Recursos"].map((l) => (
                <a
                  key={l}
                  href={`#${l === "Inicio" ? "hero" : l === "Sobre mí" ? "sobre-mi" : l.toLowerCase()}`}
                  className="font-body text-sm text-foreground/60 hover:text-foreground transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-sm tracking-widest uppercase text-foreground/40 mb-4">¿Conectamos?</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/34666359421?text=Hola%20Natalia%2C%20tengo%20una%20duda"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-body text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                <Phone className="w-4 h-4" /> WhatsApp
              </a>
              <a
                href="mailto:nataliarico.essentia@gmail.com"
                className="flex items-center gap-2 font-body text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" /> nataliarico.essentia@gmail.com
              </a>
              <a
                href="https://instagram.com/natalia.essentia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-body text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" /> @natalia.essentia
              </a>
            </div>
            <div className="mt-6">
              <a
                href="https://calendly.com/nataliaessentia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-secondary text-secondary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Agendar llamada gratuita
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="font-body text-xs text-foreground/40">
            © {new Date().getFullYear()} <span className="font-display">Natalia</span> <span className="font-display">Essentia</span>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
