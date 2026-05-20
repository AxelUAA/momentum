"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Image from "next/image";
import type { TimelineItem } from "@/types/event-settings";

export function StoryTimeline({ items, story }: { items?: TimelineItem[]; story?: string }) {
  if (!items?.length && !story) return null;

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.8], ["0%", "100%"]);

  return (
    <section ref={containerRef} style={{ position: "relative" }} className="relative w-full overflow-hidden bg-[#0F1B2D] py-24 md:py-32 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <motion.h2 
          className="font-heading text-4xl md:text-6xl text-[var(--color-champagne)] mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          Nuestra Historia
        </motion.h2>
        <motion.p
          className="text-[#F4E3C5]/70 max-w-2xl mx-auto font-sans leading-relaxed mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2 }}
        >
          {story}
        </motion.p>
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Línea central */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[var(--color-champagne)]/20 hidden md:block" />
        <motion.div 
          className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-[var(--color-champagne)] hidden md:block" 
          style={{ height: lineHeight }}
        />

        <div className="flex flex-col gap-16 md:gap-32">
          {(items ?? []).map((item: any, index: number) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div 
                key={index}
                className={`flex flex-col md:flex-row items-center justify-between w-full gap-8 md:gap-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-150px" }}
                transition={{ duration: 0.8 }}
              >
                {/* Contenido (Texto) */}
                <div className={`w-full md:w-5/12 flex flex-col ${isEven ? 'md:items-start md:text-left' : 'md:items-end md:text-right'} items-center text-center`}>
                  <span className="font-serif font-bold text-5xl md:text-7xl italic text-[var(--color-champagne)] mb-2">
                    {item.year}
                  </span>
                  <h3 className="font-heading text-2xl md:text-3xl text-[#F4E3C5] mb-4">
                    {item.title}
                  </h3>
                  <p className="text-[#F4E3C5]/70 leading-relaxed max-w-sm">
                    {item.desc}
                  </p>
                </div>

                {/* Punto central (Desktop) */}
                <div className="hidden md:flex relative z-10 w-2/12 justify-center items-center">
                  <div className="w-4 h-4 rounded-full bg-[#0F1B2D] border-2 border-[var(--color-champagne)] relative z-10">
                    <div className="absolute inset-1 rounded-full bg-[var(--color-champagne)]" />
                  </div>
                </div>

                {/* Imagen */}
                <div className="w-full md:w-5/12 flex justify-center">
                  <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border border-[var(--color-champagne)]/30 p-2">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title || `Momento ${item.year}`}
                          fill
                          sizes="(min-width: 768px) 20rem, 16rem"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[#1B3A5C] to-[#0F1B2D] flex items-center justify-center">
                          <span className="text-[var(--color-champagne)]/20 text-4xl font-serif italic">Foto</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
