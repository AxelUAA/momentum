"use client";

import Link from "next/link";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";

// Real templates that we have
const TEMPLATES = [
  { id: "aurora", type: "Boda", color1: "#1B3A5C", color2: "#0F1B2D", name: "Aurora", url: "/demo" },
  { id: "bloom", type: "XV Años", color1: "#DDA0DD", color2: "#FFB6C1", name: "Bloom", url: "/demo/quince" },
  { id: "confetti", type: "Cumpleaños", color1: "#FF6B6B", color2: "#FFD166", name: "Confetti", url: "/demo/birthday" },
  { id: "nube", type: "Baby Shower", color1: "#A2C4C9", color2: "#F9FBFC", name: "Nube", url: "/demo/baby-shower" },
];

export function TemplatesShowcase() {
  return (
    <section id="templates" className="w-full bg-background py-24 overflow-hidden border-y border-border">
      <div className="container mx-auto px-4 md:px-6 mb-16 text-center">
        <h2 className="font-heading text-4xl sm:text-5xl text-foreground">
          Colección de Plantillas
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Diseños de clase mundial, listos para tu evento.
        </p>
      </div>

      <div className="relative flex w-full overflow-hidden pb-10">
        {/* Gradients for smooth fading edges */}
        <div className="pointer-events-none absolute left-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-40" />
        <div className="pointer-events-none absolute right-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-40" />

        {/* Carousel / Marquee */}
        <motion.div
          className="flex gap-8 px-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        >
          {/* Double array for infinite scroll (we duplicate it more times to make sure it fills the screen) */}
          {[...TEMPLATES, ...TEMPLATES, ...TEMPLATES, ...TEMPLATES].map((t, idx) => (
            <motion.div
              key={`${t.id}-${idx}`}
              className="relative shrink-0 group"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link href={t.url}>
                <Card className="flex h-[400px] w-[250px] flex-col overflow-hidden rounded-[24px] border-none shadow-xl hover:shadow-2xl">
                  {/* Visual Placeholder for Template */}
                  <div 
                    className="flex-1 flex flex-col items-center justify-center p-6 relative transition-all duration-500"
                    style={{ background: `linear-gradient(135deg, ${t.color1}, ${t.color2})` }}
                  >
                    {/* Faux Text / Layout lines */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                    <div className="text-center z-10 transition-transform duration-300 group-hover:-translate-y-4">
                      <p className="text-white/70 text-xs tracking-widest uppercase mb-4 font-bold">{t.type}</p>
                      <h4 className="font-heading text-4xl text-white">{t.name}</h4>
                    </div>

                    {/* Hover Button */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-20">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-6 py-2 text-sm font-bold text-white border border-white/30 whitespace-nowrap shadow-lg">
                        ✨ Ver Demo
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
