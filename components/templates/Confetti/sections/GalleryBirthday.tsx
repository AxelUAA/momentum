"use client";

import { motion } from "motion/react";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useCallback, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const PLACEHOLDER_IMAGES = [
  { src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1000", alt: "Fiesta 1" },
  { src: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=1000", alt: "Fiesta 2" },
  { src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000", alt: "Fiesta 3" },
  { src: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1000", alt: "Fiesta 4" },
  { src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000", alt: "Fiesta 5" },
];

export function GalleryBirthday({
  images,
  primaryColor,
}: {
  images: string[];
  primaryColor: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });
  const [openIndex, setOpenIndex] = useState(-1);
  const [scrollProgress, setScrollProgress] = useState(0);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    setScrollProgress(Math.max(0, Math.min(1, emblaApi.scrollProgress())) * 100);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll();
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
  }, [emblaApi, onScroll]);

  const displayImages =
    images?.length > 0
      ? images.map((src) => ({ src, alt: "Foto" }))
      : PLACEHOLDER_IMAGES;

  return (
    <section className="w-full bg-[#FFFBF5] py-24 px-0 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="font-black text-4xl md:text-5xl text-[#1A1A1A]">
            Momentos{" "}
            <span style={{ color: primaryColor }}>especiales</span>
          </h2>
          <p className="text-[#666] mt-2 font-medium">Desliza para ver más</p>
        </motion.div>
      </div>

      <div className="pl-4 md:pl-10">
        <div
          className="overflow-hidden cursor-grab active:cursor-grabbing"
          ref={emblaRef}
        >
          <div className="flex gap-4 md:gap-6 backface-hidden">
            {displayImages.map((img, i) => (
              <motion.div
                key={i}
                className="relative flex-[0_0_240px] md:flex-[0_0_320px] aspect-[9/16] rounded-3xl overflow-hidden shadow-xl"
                style={{ border: `2px solid ${primaryColor}40` }}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onClick={() => setOpenIndex(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="absolute block w-full h-full object-cover select-none transition-transform duration-700 hover:scale-105 cursor-pointer"
                  draggable={false}
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-10 mt-10">
        <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%`, backgroundColor: primaryColor }}
          />
        </div>
      </div>

      <Lightbox
        open={openIndex >= 0}
        close={() => setOpenIndex(-1)}
        index={openIndex}
        slides={displayImages.map((img) => ({ src: img.src }))}
        styles={{ container: { backgroundColor: "rgba(0,0,0,0.95)" } }}
      />
    </section>
  );
}
