"use client";

import { motion } from "motion/react";
import Image from "next/image";

export function AboutSection({
  celebrantName,
  bio,
  funFacts,
  photo,
  primaryColor,
}: {
  celebrantName: string;
  bio: string;
  funFacts: string[];
  photo?: string;
  primaryColor: string;
}) {
  const facts = funFacts?.slice(0, 5) ?? [];
  const firstName = celebrantName?.split(" ")[0] ?? celebrantName;

  return (
    <section className="w-full bg-[#FFFBF5] py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-black text-4xl md:text-6xl text-[#1A1A1A]">
            ¿Quién es{" "}
            <span style={{ color: primaryColor }}>{firstName}</span>?
          </h2>
        </motion.div>

        <div className={`flex flex-col gap-12 items-start ${photo ? "md:flex-row" : ""}`}>
          {/* Bio + fun facts */}
          <motion.div
            className={photo ? "flex-1" : "max-w-2xl mx-auto text-center"}
            initial={{ opacity: 0, x: photo ? -30 : 0, y: photo ? 0 : 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
          >
            {bio && (
              <p className="text-[#333] text-lg md:text-xl leading-relaxed font-medium mb-10">
                {bio}
              </p>
            )}

            {facts.length > 0 && (
              <div className={`flex flex-wrap gap-3 ${!photo ? "justify-center" : ""}`}>
                {facts.map((fact, i) => (
                  <motion.div
                    key={i}
                    className="px-4 py-2 rounded-full text-sm font-bold border-2 cursor-default"
                    style={{
                      borderColor: primaryColor,
                      color: primaryColor,
                      backgroundColor: `${primaryColor}12`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.06 }}
                  >
                    {fact}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Optional photo */}
          {photo && (
            <motion.div
              className="w-full md:w-80 flex-shrink-0"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div
                className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4"
                style={{ borderColor: primaryColor }}
              >
                <Image src={photo} alt={celebrantName} fill className="object-cover" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
