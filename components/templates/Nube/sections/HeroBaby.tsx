"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Event } from "@prisma/client";

export function HeroBaby({
  event,
  parentNames,
  babyName,
  primaryColor,
  coverImage,
}: {
  event: Event;
  parentNames: { mom: string; dad?: string };
  babyName?: string;
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

  const parentsText = parentNames.dad
    ? `${parentNames.mom} & ${parentNames.dad}`
    : parentNames.mom;

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center bg-[#F9FBFC]">
      {/* Background Image & Soft Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{
          backgroundImage: coverImage
            ? `url(${coverImage})`
            : 'url("https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2070&auto=format&fit=crop")', // Soft background default
        }}
      />
      {/* Gradient that matches Nube style */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-[#F9FBFC]/80 to-[#F9FBFC]" />

      {/* Cloud Decorative SVGs */}
      <div className="absolute top-10 right-10 opacity-30 w-32 hidden md:block">
        <svg viewBox="0 0 24 24" fill={primaryColor} stroke="none">
          <path d="M17.5,19c2.5,0,4.5-2,4.5-4.5c0-2.3-1.8-4.2-4.1-4.4C17.6,7.2,15,5,12,5C8.4,5,5.4,7.8,5.1,11.3C2.8,11.5,1,13.5,1,15.9 C1,18.7,3.3,21,6.1,21h11.4V19z" />
        </svg>
      </div>
      <div className="absolute bottom-20 left-10 opacity-30 w-40 hidden md:block">
        <svg viewBox="0 0 24 24" fill={primaryColor} stroke="none">
          <path d="M17.5,19c2.5,0,4.5-2,4.5-4.5c0-2.3-1.8-4.2-4.1-4.4C17.6,7.2,15,5,12,5C8.4,5,5.4,7.8,5.1,11.3C2.8,11.5,1,13.5,1,15.9 C1,18.7,3.3,21,6.1,21h11.4V19z" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="bg-white/60 backdrop-blur-md p-10 md:p-16 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50"
        >
          <span
            className="text-sm md:text-base uppercase tracking-[0.2em] font-medium mb-6 block"
            style={{ color: primaryColor }}
          >
            Baby Shower
          </span>
          <h1 className="font-sans text-5xl md:text-7xl font-bold tracking-tight text-[#2c3e50] mb-4">
            {babyName ? babyName : "¿Será niña o niño?"}
          </h1>
          <p className="text-lg md:text-2xl text-[#7f8c8d] mb-10 font-medium">
            {parentsText} te invitan a celebrar
          </p>

          {/* Countdown */}
          {event.eventDate && (
            <div className="flex justify-center gap-4 md:gap-8 bg-white/80 p-6 md:p-8 rounded-[2rem] shadow-sm">
              {[
                { label: "Días", value: timeLeft.dias },
                { label: "Horas", value: timeLeft.horas },
                { label: "Mins", value: timeLeft.mins },
                { label: "Segs", value: timeLeft.segs },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center min-w-[60px] md:min-w-[80px]">
                  <span className="text-3xl md:text-5xl font-bold mb-1" style={{ color: primaryColor }}>
                    {item.value.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#95a5a6] font-bold">
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
