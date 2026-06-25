import HeroSection from "@/src/components/home/HeroSection";
import BenefitSection from "@/src/components/home/BenefitSection";
import FAQSection from "@/src/components/home/FAQSection";
import About from "@/src/components/home/About";
import MapSection from "@/src/components/home/MapSection";
import { generateSiteMetadata } from "@/src/lib/pageMetadata";

export function generateMetadata() {
  return generateSiteMetadata({
    path: "/",
    fallbackTitle: "Rebar Coupler BD",
  });
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <BenefitSection />
      <About />
      <FAQSection />
      <MapSection />
    </>
  );
}
