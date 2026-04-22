"use client";

import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { Spotlight } from "@/components/effects/Spotlight";
import { TextReveal } from "@/components/effects/TextReveal";
import { ConfettiParticles } from "@/components/effects/ConfettiParticles";
import { PhoneMockup } from "@/components/effects/PhoneMockup";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden bg-background pt-20">
      {/* Effects Layers */}
      <AuroraBackground />
      <Spotlight />
      <ConfettiParticles />

      {/* Content Container */}
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Text Content */}
          <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-border bg-surface/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-[var(--color-champagne)] mr-2" />
                La nueva era de invitaciones digitales
              </div>
              
              <TextReveal
                text="Donde cada momento merece ser celebrado"
                className="font-heading text-5xl tracking-tight sm:text-6xl md:text-7xl lg:justify-start"
              />

              <motion.p
                className="mx-auto max-w-[600px] text-lg text-muted-foreground md:text-xl lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Crea, envía y gestiona invitaciones digitales premium para bodas, XV años y eventos en menos de 5 minutos.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "lg" }), "shimmer h-12 rounded-full border-none px-8 text-base text-[var(--color-midnight)]")}
              >
                Crear mi invitación gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#templates"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-full px-8 text-base backdrop-blur-sm")}
              >
                Ver plantillas
              </Link>
            </motion.div>
          </div>

          {/* Visual Content (Phone Mockup) */}
          <motion.div
            className="flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
