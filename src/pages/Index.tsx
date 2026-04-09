import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ApproachSection from "@/components/ApproachSection";
import ServicesSection from "@/components/ServicesSection";
import ForYouSection from "@/components/ForYouSection";
import ProductsSection from "@/components/ProductsSection";
import ResourcesSection from "@/components/ResourcesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import { useSectionVisibility } from "@/hooks/useSectionVisibility";

const Index = () => {
  const { visibility, loaded } = useSectionVisibility();

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ApproachSection />
      <ServicesSection />
      <ForYouSection />
      {loaded && visibility.resources && <ResourcesSection />}
      {loaded && visibility.products && <ProductsSection />}
      {loaded && visibility.testimonials && <TestimonialsSection />}
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Index;
