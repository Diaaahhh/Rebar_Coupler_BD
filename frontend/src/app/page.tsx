import HeroSection from "@/src/components/home/HeroSection";
import BenefitSection from "@/src/components/home/BenefitSection";
import FAQSection from "@/src/components/home/FAQSection";
import About from "@/src/components/home/About";
import { generateSiteMetadata } from "@/src/lib/pageMetadata";
import FloatingWhatsapp from "../components/common/FloatingWhatsapp";
export function generateMetadata() {
  return generateSiteMetadata({
    path: "/",
    fallbackTitle: "Rebar Coupler Bangladesh",
  });
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <BenefitSection />
      <About />
      <FAQSection />
      <FloatingWhatsapp />
      {/* <MapSection /> */}
    </>
  );
}
