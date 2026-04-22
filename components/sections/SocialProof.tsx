"use client";

import { motion } from "motion/react";

const LOGOS = [
  "TechCrunch",
  "Forbes",
  "Vogue Mexico",
  "Expansión",
  "El Universal",
];

export function SocialProof() {
  return (
    <section className="w-full border-y border-border bg-background py-8 overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-6">
        <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
          Featured in
        </p>
        
        <div className="relative flex w-full max-w-5xl overflow-hidden">
          {/* Gradient Masks */}
          <div className="pointer-events-none absolute left-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-32" />
          <div className="pointer-events-none absolute right-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-32" />

          {/* Marquee Content */}
          <motion.div
            className="flex min-w-max items-center gap-16 pr-16"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          >
            {/* Double the logos to create seamless infinite loop */}
            {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              >
                {/* Fallback to text if no SVG available, styled to look like logos */}
                <span className="font-heading text-xl font-bold tracking-tight text-muted-foreground/80 dark:text-muted-foreground">
                  {logo}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
