"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { DressCode } from "@/types/event-settings";

export function DressCodeMoodboard({ data }: { data: DressCode }) {
  const [openIndex, setOpenIndex] = useState(-1);

  // Imágenes placeholder por si el evento no tiene
  const images = data.images?.length > 0 
    ? data.images.map(src => ({ src, alt: "Dress Code" })) 
    : [
        { src: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80", alt: "Dress Code 1" },
        { src: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80", alt: "Dress Code 2" },
        { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80", alt: "Dress Code 3" },
        { src: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80", alt: "Dress Code 4" },
      ];

  return (
    <section className="w-full bg-[#0F1B2D] py-24 md:py-32 px-4 relative overflow-hidden">
      {/* Elemento decorativo de fondo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1B3A5C] rounded-full blur-[120px] opacity-20 pointer-events-none -translate-y-1/2 translate-x-1/3" />

      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-16 relative z-10">
        
        {/* Textos */}
        <motion.div 
          className="w-full md:w-1/2 text-center md:text-left"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#F4E3C5]/70 mb-4">
            Código de Vestimenta
          </p>
          <h2 className="font-heading text-5xl md:text-7xl text-[#F4E3C5] mb-6">
            {data.name}
          </h2>
          <p className="text-[#F4E3C5]/60 max-w-md mx-auto md:mx-0 leading-relaxed">
            {data.description || "Hemos preparado un pequeño moodboard de inspiración para ayudarte a elegir tu atuendo. Nos encantaría que nos acompañes siguiendo este estilo."}
          </p>
        </motion.div>

        {/* Grid de imágenes (Pinterest style 2x2) */}
        <motion.div 
          className="w-full md:w-1/2 grid grid-cols-2 gap-4"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          {images.slice(0, 4).map((img: any, i: number) => (
            <div 
              key={i} 
              className={`relative overflow-hidden rounded-2xl cursor-pointer group shadow-xl border border-white/5 ${i % 2 === 0 ? 'mt-8 -mb-8' : ''}`}
              onClick={() => setOpenIndex(i)}
            >
              <div className="aspect-[3/4] w-full bg-slate-800 relative">
                <Image 
                  src={img.src} 
                  alt={img.alt || "Dress Code"} 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox para expandir imágenes */}
      <Lightbox
        open={openIndex >= 0}
        close={() => setOpenIndex(-1)}
        index={openIndex}
        slides={images.map((img: any) => ({ src: img.src }))}
        styles={{ container: { backgroundColor: "rgba(15, 27, 45, 0.95)" } }}
      />
    </section>
  );
}
