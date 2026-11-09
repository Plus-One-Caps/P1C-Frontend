import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { StartHere } from "@/components/home/StartHere";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Silhouettes } from "@/components/home/Silhouettes";
import { Decoration } from "@/components/home/Decoration";
import { Pricing } from "@/components/home/Pricing";
import { WhyPlusOne } from "@/components/home/WhyPlusOne";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <StartHere />
      <HowItWorks />
      <Silhouettes />
      <Decoration />
      <Pricing />
      <WhyPlusOne />
      <FinalCTA />
    </>
  );
}
