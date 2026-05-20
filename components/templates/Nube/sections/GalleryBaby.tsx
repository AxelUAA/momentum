"use client";

import { motion } from "motion/react";

export function GalleryBaby({
  images,
}: {
  images: string[];
}) {
  if (!images || images.length === 0) return null;

  return (
    <section className="w-full bg-[#F9FBFC] py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-sans text-4xl md:text-5xl font-bold text-[#2c3e50] mb-4">
            Dulces Recuerdos
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative aspect-square rounded-[2rem] overflow-hidden group shadow-sm bg-white p-2"
            >
              <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                <img
                  src={src}
                  alt={`Galería ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
