"use client";

import { motion } from "motion/react";
import type { EventColors, DressCode } from "@/types/event-settings";

export function ThemeSection({
  theme,
  colors,
  dressCode,
  primaryColor,
}: {
  theme: string;
  colors?: EventColors;
  dressCode?: DressCode;
  primaryColor: string;
}) {
  return (
    <section className="w-full bg-[#F9FBFC] py-24 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-[#95a5a6] mb-2 block">
            Temática del Evento
          </span>
          <h2 className="font-sans text-4xl md:text-5xl font-bold text-[#2c3e50] mb-8 capitalize">
            {theme}
          </h2>

          {colors && (
            <div className="flex justify-center gap-6">
              {[colors.primary, colors.secondary, colors.accent].map((c, i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-full shadow-sm border-4 border-white"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {dressCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2rem] p-10 shadow-sm border border-[#ecf0f1]"
          >
            <h3 className="font-sans text-2xl font-bold text-[#34495e] mb-4">
              Código de Vestimenta: <span style={{ color: primaryColor }}>{dressCode.name}</span>
            </h3>
            <p className="text-[#7f8c8d] font-medium">
              {dressCode.description}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
