"use client";

import { motion } from "motion/react";

export function QuinceStory({
  story,
  primaryColor,
}: {
  story: string;
  primaryColor: string;
}) {
  if (!story) return null;

  return (
    <section className="w-full bg-[#FAFAFA] py-24 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C12 2 12 10 2 12C12 14 12 22 12 22C12 22 12 14 22 12C12 10 12 2 12 2Z" fill={`${primaryColor}33`} />
          </svg>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2c2c2c] mb-6">
            Su Historia
          </h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg md:text-xl text-[#666] leading-relaxed max-w-2xl font-light">
            {story}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
