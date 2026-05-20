"use client";

import { motion } from "motion/react";
import type { DressCode, EventColors } from "@/types/event-settings";

export function DressCodeBloom({
  data,
  colors,
}: {
  data: DressCode;
  colors?: EventColors;
}) {
  const label = data?.name || (data as any)?.title;
  if (!data || !label) return null;

  return (
    <section className="w-full bg-white py-24 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-[#2c2c2c] mb-6">
            Código de Vestimenta
          </h2>
          <div className="inline-block px-8 py-3 rounded-full bg-[#FAFAFA] border border-[#f0f0f0] mb-6">
            <span className="font-serif text-2xl text-[#333] tracking-wider">
              {label}
            </span>
          </div>
          <p className="text-[#666] max-w-2xl mx-auto text-lg leading-relaxed font-light">
            {data.description}
          </p>
        </motion.div>

        {/* Color Palette (if available) */}
        {colors && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4 mb-16"
          >
            {[colors.primary, colors.secondary, colors.accent].map((c, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full shadow-md border-2 border-white"
                style={{ backgroundColor: c }}
              />
            ))}
          </motion.div>
        )}

        {/* Moodboard Images */}
        {data.images && data.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {data.images.map((img, idx) => (
              <div 
                key={idx} 
                className="aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={img}
                  alt={`Inspiración de vestimenta ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
