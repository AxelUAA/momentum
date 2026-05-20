"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { DressCode } from "@/types/event-settings";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=500",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=500",
  "https://images.unsplash.com/photo-1566206091558-7f218b696731?q=80&w=500",
];

export function DressCodeBirthday({
  data,
  primaryColor,
}: {
  data: DressCode;
  primaryColor: string;
}) {
  const [openIndex, setOpenIndex] = useState(-1);

  const label = data?.name || (data as any)?.title;
  if (!label) return null;

  const rawImages = data?.images?.slice(0, 3) ?? [];
  const displayImages = rawImages.length > 0 ? rawImages : PLACEHOLDER_IMAGES;

  return (
    <section className="w-full bg-white py-24 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-black text-4xl md:text-6xl text-[#1A1A1A]">Dress Code</h2>

          {label && (
            <div
              className="inline-block mt-4 px-6 py-2 rounded-full font-black text-xl md:text-2xl text-white shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {label}
            </div>
          )}

          {data?.description && (
            <p className="mt-6 text-[#555] text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              {data.description}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {displayImages.map((src, i) => (
            <motion.div
              key={i}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-md"
              style={{ border: `2px solid ${primaryColor}30` }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setOpenIndex(i)}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Dress code ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>

        <Lightbox
          open={openIndex >= 0}
          close={() => setOpenIndex(-1)}
          index={openIndex}
          slides={displayImages.map((src) => ({ src }))}
        />
      </div>
    </section>
  );
}
