"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import Image from "next/image";

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hrs: 0, min: 0, seg: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hrs: 0, min: 0, seg: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hrs: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        min: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seg: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const blocks = [
    { value: timeLeft.days, label: "DÍAS" },
    { value: timeLeft.hrs, label: "HRS" },
    { value: timeLeft.min, label: "MIN" },
    { value: timeLeft.seg, label: "SEG" },
  ];

  return (
    <div className="flex w-full items-center justify-center gap-0 mt-12 mb-8">
      {blocks.map((block, i) => (
        <div key={block.label} className="flex items-center">
          <div className="flex flex-col items-center px-4 md:px-6">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={block.value}
                className="block font-heading text-3xl md:text-5xl text-[var(--color-champagne)]"
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 15, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {String(block.value).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
            <span className="mt-2 text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-[#F4E3C5]/60">
              {block.label}
            </span>
          </div>
          {i < blocks.length - 1 && (
            <div className="h-10 w-px bg-[var(--color-champagne)] opacity-30" />
          )}
        </div>
      ))}
    </div>
  );
}

// Decorative floral corners
const FloralSVG = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={`absolute w-32 md:w-48 opacity-20 text-[var(--color-champagne)] ${className}`}
    fill="currentColor"
  >
    <path d="M0,0 C20,30 40,40 60,30 C50,50 30,70 0,80 Z" />
    <path d="M0,0 C30,10 50,0 60,-20 C50,10 20,20 0,30 Z" transform="translate(10, 10)" opacity="0.6" />
    <circle cx="20" cy="20" r="2" />
    <circle cx="35" cy="15" r="1.5" />
    <circle cx="15" cy="40" r="1" />
  </svg>
);

function formatEventDate(raw: Date | string | null | undefined): string {
  if (!raw) return "FECHA POR CONFIRMAR";
  const d = typeof raw === "string" ? new Date(raw) : raw;
  if (isNaN(d.getTime())) return "FECHA POR CONFIRMAR";
  // timeZone: "UTC" evita que fechas date-only pierdan un día por zona horaria
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(d).toUpperCase();
}

export function HeroCountdown({ event }: { event: any }) {
  const formattedDate = formatEventDate(event.eventDate);

  return (
    <section className="relative flex min-h-[90vh] md:min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      {/* Imagen de portada como fondo (si existe) */}
      {event.coverImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={event.coverImage}
            alt={event.title || "Portada"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Overlay oscuro para mantener legibilidad del texto champagne */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1B2D]/70 via-[#0F1B2D]/60 to-[#0F1B2D]/80" />
        </div>
      )}

      {/* Esquinas Florales */}
      <FloralSVG className="top-0 left-0" />
      <FloralSVG className="top-0 right-0 rotate-90" />
      <FloralSVG className="bottom-0 left-0 -rotate-90" />
      <FloralSVG className="bottom-0 right-0 rotate-180" />

      {/* Partículas Doradas Sutiles Background */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[var(--color-champagne)]"
            style={{
              width: Math.random() * 4 + 1 + "px",
              height: Math.random() * 4 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              y: [0, Math.random() * -50 - 20],
              opacity: [0, Math.random() * 0.5 + 0.2, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.p
          className="mb-6 font-sans text-sm md:text-base tracking-[0.3em] text-[#F4E3C5]/80 uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          NOS CASAMOS
        </motion.p>

        <motion.h1
          className="bg-gradient-to-r from-[#F4E3C5] via-[#D4AF7A] to-[#C49A60] bg-clip-text font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-transparent drop-shadow-sm pb-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          {event.title}
        </motion.h1>

        <motion.div
          className="mt-6 font-serif text-2xl md:text-3xl italic text-[#F4E3C5]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {formattedDate}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-full"
        >
          {event.eventDate && <Countdown targetDate={event.eventDate} />}
        </motion.div>
      </div>
    </section>
  );
}
