import { motion } from "framer-motion";
import heroBg from "@/assets/natalia-hero.jpg";
import essentiaTitleImg from "@/assets/essentia-text-only.png";
import essentiaWomanLogo from "@/assets/essentia-woman-logo-final.png";

const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Campo de lavanda al atardecer"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <img
              src={essentiaTitleImg}
              alt="Essentia"
              className="w-auto max-w-[280px] md:max-w-[420px] lg:max-w-[480px] h-auto"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight mb-6"
          >
            Reconecta con la naturaleza<br className="hidden md:inline lg:hidden" /> funcional de tu cuerpo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-body text-lg md:text-xl text-foreground/80 leading-relaxed mb-10 max-w-xl"
          >
            Acompaño tu proceso para recuperar vitalidad y bienestar
            <br className="hidden md:inline lg:hidden" />
            {" "}abordando el origen desde un enfoque integral,
            <br className="hidden md:inline lg:hidden" />
            {" "}sea cual sea tu punto de partida y objetivo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="https://calendly.com/nataliaessentia"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-medium text-center hover:bg-olive-dark transition-colors"
            >
              Agendar sesión gratuita
            </a>
            <a
              href="#servicios"
              className="bg-secondary text-secondary-foreground px-8 py-3.5 rounded-lg font-medium text-center hover:opacity-90 transition-opacity"
            >
              Servicios
            </a>
          </motion.div>
        </div>
      </div>

      {/* Woman logo centered at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <img
          src={essentiaWomanLogo}
          alt="Essentia logo"
          className="h-28 md:h-36 w-auto opacity-80"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
