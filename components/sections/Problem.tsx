"use client";

import { motion } from "motion/react";

export function Problem() {
  return (
    <section className="relative flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden bg-background py-24">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-dusty-rose)] opacity-5 blur-[120px] rounded-full" />
      
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-foreground">
            Las invitaciones de papel son caras, lentas y se pierden. <br className="hidden md:block" />
            Las digitales genéricas se ven baratas. <br className="hidden md:block" />
            <span className="text-gradient-champagne mt-4 block">Momentum cambia esto.</span>
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
