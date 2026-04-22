"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";

// Placeholder data for templates
const TEMPLATES = [
  { id: 1, type: "Boda", color1: "#1B3A5C", color2: "#0F1B2D", name: "Classic Midnight" },
  { id: 2, type: "XV Años", color1: "#D4AF7A", color2: "#C49A60", name: "Golden Rose" },
  { id: 3, type: "Bautizo", color1: "#FAF7F2", color2: "#E8E2D5", name: "Pure Cream" },
  { id: 4, type: "Corporativo", color1: "#C9A8A0", color2: "#A5857E", name: "Dusty Minimal" },
  { id: 5, type: "Boda", color1: "#5B8C7B", color2: "#3A5C4F", name: "Emerald Dream" },
  { id: 6, type: "Cumpleaños", color1: "#0F1B2D", color2: "#D4AF7A", name: "Royal Contrast" },
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
          {/* Double array for infinite scroll */}
          {[...TEMPLATES, ...TEMPLATES].map((t, idx) => (
            <motion.div
              key={`${t.id}-${idx}`}
              className="relative shrink-0"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="flex h-[400px] w-[250px] flex-col overflow-hidden rounded-[24px] border-none shadow-xl hover:shadow-2xl">
                {/* Visual Placeholder for Template */}
                <div 
                  className="flex-1 flex flex-col items-center justify-center p-6 relative"
                  style={{ background: `linear-gradient(135deg, ${t.color1}, ${t.color2})` }}
                >
                  {/* Faux Text / Layout lines */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                  <div className="text-center z-10">
                    <p className="text-white/70 text-xs tracking-widest uppercase mb-4">{t.type}</p>
                    <h4 className="font-display text-2xl text-white">{t.name}</h4>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
