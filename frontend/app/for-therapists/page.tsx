import CTA from "./components/CTA";
import Features from "./components/Features";
import Hero from "./components/Hero";
import PainPoints from "./components/PainPoints";
import PricingTeaser from "./components/PricingTeaser";

import Workflow from "./components/Workflow";


export default function ForTherapistsPage() {
  return (
    <>
      <Hero />
      <PainPoints />
      <Features />
      <Workflow />
      <PricingTeaser />
      <CTA />
    </>
  );
}