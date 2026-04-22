"use client";

import { motion } from "motion/react";
import { ConfettiParticles } from "@/components/effects/ConfettiParticles";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-midnight)] py-32">
      <ConfettiParticles />
      
      {/* Background radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[var(--color-champagne)] opacity-10 blur-[100px]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mx-auto max-w-3xl font-heading text-5xl sm:text-6xl text-[var(--color-cream)] leading-tight">
            Tu evento merece una invitación inolvidable
          </h2>
          
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg" }), "shimmer h-14 rounded-full border-none px-10 text-lg font-medium text-[var(--color-midnight)]")}
            >
              Empezar gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <p className="text-sm text-[var(--color-cream)]/60">
              Sin tarjeta de crédito · Cancela cuando quieras
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
