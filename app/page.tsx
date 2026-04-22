import dynamic from "next/dynamic";
import { auth } from "@/auth";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ValueProps } from "@/components/sections/ValueProps";
import { Problem } from "@/components/sections/Problem";

// Lazy load heavy/below-the-fold components for better performance
const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks").then(mod => mod.HowItWorks));
const TemplatesShowcase = dynamic(() => import("@/components/sections/TemplatesShowcase").then(mod => mod.TemplatesShowcase));
const Features = dynamic(() => import("@/components/sections/Features").then(mod => mod.Features));
const Pricing = dynamic(() => import("@/components/sections/Pricing").then(mod => mod.Pricing));
const Testimonials = dynamic(() => import("@/components/sections/Testimonials").then(mod => mod.Testimonials));
const FAQ = dynamic(() => import("@/components/sections/FAQ").then(mod => mod.FAQ));
const FinalCTA = dynamic(() => import("@/components/sections/FinalCTA").then(mod => mod.FinalCTA));
const Footer = dynamic(() => import("@/components/sections/Footer").then(mod => mod.Footer));

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-between">
      <Navbar session={session} />
      <main className="w-full flex-1 flex flex-col">
        <Hero />
        <ValueProps />
        <Problem />
        <HowItWorks />
        <TemplatesShowcase />
        <Features />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
