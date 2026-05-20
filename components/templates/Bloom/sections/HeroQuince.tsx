"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Event } from "@prisma/client";

export function HeroQuince({
  event,
  celebrantName,
  primaryColor,
  coverImage,
}: {
  event: Event;
  celebrantName: string;
  primaryColor: string;
  coverImage: string | null;
}) {
  const [timeLeft, setTimeLeft] = useState({
    dias: 0,
    horas: 0,
    mins: 0,
    segs: 0,
  });

  useEffect(() => {
    if (!event.eventDate) return;
    const targetDate = new Date(event.eventDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        dias: Math.floor(distance / (1000 * 60 * 60 * 24)),
        horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        segs: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [event.eventDate]);

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-stone-100 flex items-center justify-center">
      {/* Background Image & Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: coverImage
            ? `url(${coverImage})`
            : 'url("https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />

      {/* Decorative Floral SVG (CSS approach) */}
      <div className="absolute top-8 left-8 w-24 h-24 opacity-70 pointer-events-none hidden md:block">
        <svg viewBox="0 0 100 100" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 0 C60 30, 90 40, 100 50 C90 60, 60 70, 50 100 C40 70, 10 60, 0 50 C10 40, 40 30, 50 0 Z" />
          <circle cx="50" cy="50" r="10" />
        </svg>
      </div>
      <div className="absolute bottom-8 right-8 w-24 h-24 opacity-70 pointer-events-none hidden md:block rotate-180">
        <svg viewBox="0 0 100 100" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 0 C60 30, 90 40, 100 50 C90 60, 60 70, 50 100 C40 70, 10 60, 0 50 C10 40, 40 30, 50 0 Z" />
          <circle cx="50" cy="50" r="10" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <span
            className="text-lg md:text-2xl uppercase tracking-[0.3em] font-serif mb-4 block"
            style={{ color: primaryColor }}
          >
            Mis XV Años
          </span>
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tight mb-6">
            {celebrantName}
          </h1>
          <p className="text-xl md:text-3xl font-light tracking-wider mb-12">
            {event.eventDate
              ? new Date(event.eventDate).toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Fecha por definir"}
          </p>

          {/* Countdown */}
          {event.eventDate && (
            <div className="flex justify-center gap-4 md:gap-8 backdrop-blur-sm bg-white/10 p-6 md:p-8 rounded-3xl border border-white/20 shadow-xl">
              {[
                { label: "Días", value: timeLeft.dias },
                { label: "Horas", value: timeLeft.horas },
                { label: "Mins", value: timeLeft.mins },
                { label: "Segs", value: timeLeft.segs },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center min-w-[60px] md:min-w-[80px]">
                  <span className="text-3xl md:text-5xl font-serif mb-1" style={{ color: primaryColor }}>
                    {item.value.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[10px] md:text-xs uppercase tracking-widest text-white/80">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
