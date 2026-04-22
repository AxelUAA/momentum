"use client";

import { motion } from "motion/react";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useCallback, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export function PhotoGallery({ images }: { images: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true
  });
  
  const [openIndex, setOpenIndex] = useState(-1);
  const [scrollProgress, setScrollProgress] = useState(0);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress * 100);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll();
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
  }, [emblaApi, onScroll]);

  // Si no hay fotos, usamos unas de placeholder
  const displayImages = images?.length > 0 
    ? images.map(src => ({ src, alt: "Gallery photo" })) 
    : [
        { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000", alt: "Gallery 1" },
        { src: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000", alt: "Gallery 2" },
        { src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1000", alt: "Gallery 3" },
        { src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1000", alt: "Gallery 4" },
        { src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000", alt: "Gallery 5" },
      ];

  return (
    <section className="w-full bg-[#1B3A5C] py-24 px-0 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-10 mb-12 flex justify-between items-end">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="font-heading text-4xl md:text-5xl text-[#F4E3C5]">
            Nuestros Momentos
          </h2>
          <p className="text-[#F4E3C5]/70 mt-2 font-sans">
            Desliza para ver más
          </p>
        </motion.div>
      </div>

      {/* Embla Carousel */}
      <div className="pl-4 md:pl-10">
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6 backface-hidden">
            {displayImages.map((img: any, i: number) => (
              <motion.div 
                key={i}
                className="relative flex-[0_0_240px] md:flex-[0_0_320px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onClick={() => setOpenIndex(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={img.src} 
                  alt={img.alt || `Photo ${i + 1}`}
                  className="absolute block w-full h-full object-cover select-none transition-transform duration-700 hover:scale-105"
                  draggable={false}
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Barra de progreso tipo Instagram Stories */}
      <div className="mx-auto max-w-7xl px-4 md:px-10 mt-12">
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--color-champagne)] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      <Lightbox
        open={openIndex >= 0}
        close={() => setOpenIndex(-1)}
        index={openIndex}
        slides={displayImages.map((img: any) => ({ src: img.src }))}
        styles={{ container: { backgroundColor: "rgba(15, 27, 45, 0.95)" } }}
      />
    </section>
  );
}
