import Hero from "./components/Hero";
import QuickActions from "./components/QuickActions";
import Topics from "./components/Topics";

import FooterCTA from "./components/FooterCTA";


export default function SupportPage() {
  return (
    <main className="bg-white">
      <section className="bg-[#F7F8FC]">
        <div className="mx-auto max-w-6xl px-6 py-18 md:py-20">
          <Hero />
          <QuickActions />
          <Topics />
        </div>
      </section>

     

      <FooterCTA />
    </main>
  );
}