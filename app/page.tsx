import nextDynamic from "next/dynamic";
import { auth } from "@/auth";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ValueProps } from "@/components/sections/ValueProps";
import { Problem } from "@/components/sections/Problem";

// Lazy load heavy/below-the-fold components for better performance
const HowItWorks = nextDynamic(() => import("@/components/sections/HowItWorks").then(mod => mod.HowItWorks));
const TemplatesShowcase = nextDynamic(() => import("@/components/sections/TemplatesShowcase").then(mod => mod.TemplatesShowcase));
const Features = nextDynamic(() => import("@/components/sections/Features").then(mod => mod.Features));
const Pricing = nextDynamic(() => import("@/components/sections/Pricing").then(mod => mod.Pricing));
const Testimonials = nextDynamic(() => import("@/components/sections/Testimonials").then(mod => mod.Testimonials));
const FAQ = nextDynamic(() => import("@/components/sections/FAQ").then(mod => mod.FAQ));
const FinalCTA = nextDynamic(() => import("@/components/sections/FinalCTA").then(mod => mod.FinalCTA));
const Footer = nextDynamic(() => import("@/components/sections/Footer").then(mod => mod.Footer));

export const dynamic = "force-dynamic";

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
