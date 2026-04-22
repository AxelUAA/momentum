"use client";

import { motion } from "motion/react";

const STATS = [
  { value: "2,000+", label: "Eventos creados" },
  { value: "150K+", label: "Invitados enviados" },
  { value: "4.9 ★", label: "Calificación promedio" },
  { value: "98%", label: "Clientes satisfechos" },
];

export function SocialProof() {
  return (
    <section className="w-full border-y border-border bg-background py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center gap-2 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <span className="font-heading text-4xl sm:text-5xl text-[var(--color-champagne)]">
                {stat.value}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
