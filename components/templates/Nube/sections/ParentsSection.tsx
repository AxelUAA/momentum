"use client";

import { motion } from "motion/react";
import { Heart } from "lucide-react";

export function ParentsSection({
  parentNames,
  babyName,
  primaryColor,
}: {
  parentNames: { mom: string; dad?: string };
  babyName?: string;
  primaryColor: string;
}) {
  const parentsText = parentNames.dad
    ? `${parentNames.mom} & ${parentNames.dad}`
    : parentNames.mom;

  return (
    <section className="w-full bg-white py-24 px-4 text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div 
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-sans text-4xl md:text-5xl font-bold text-[#2c3e50] mb-6">
            Nuestra Familia Crece
          </h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg md:text-xl text-[#7f8c8d] leading-relaxed max-w-2xl font-medium mb-8">
            Estamos muy felices de compartir este momento tan especial con las personas que más queremos. ¡No podemos esperar para conocerte!
          </p>
          <div className="inline-block px-8 py-4 rounded-full bg-[#F9FBFC] border border-[#ecf0f1]">
            <p className="text-[#34495e] font-bold text-lg">
              {parentsText} <span className="font-normal text-[#95a5a6] mx-2">esperan a</span> <span style={{ color: primaryColor }}>{babyName ? babyName : "¡Un hermoso bebé!"}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
