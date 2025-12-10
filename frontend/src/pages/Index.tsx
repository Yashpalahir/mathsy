import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CoursesPreview } from "@/components/home/CoursesPreview";
import { DemoVideos } from "@/components/home/DemoVideos";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <CoursesPreview />
      <DemoVideos />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
