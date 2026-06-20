import Image from "next/image";
import HeroSection from "@/src/components/home/HeroSection";
import BenefitSection from "@/src/components/home/BenefitSection";
import FAQSection from "@/src/components/home/FAQSection";
import About from "@/src/components/home/About";
import MapSection from "@/src/components/home/MapSection";

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
