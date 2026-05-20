"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import Image from "next/image";

// Deterministic particle config to avoid hydration mismatches
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  size: (i % 10) + 6,
  height: i % 3 === 0 ? (i % 10) + 6 : ((i % 10) + 6) * 0.4,
  top: (i * 37 + 11) % 100,
  left: (i * 53 + 7) % 100,
  opacity: (i % 6) * 0.08 + 0.2,
  isCircle: i % 3 === 0,
  duration: (i % 6) + 5,
  delay: i % 5,
  yEnd: -((i % 8) * 10 + 40),
  xEnd: (i % 2 === 0 ? 1 : -1) * ((i % 5) * 10 + 15),
  rotateEnd: i % 2 === 0 ? 360 : -360,
}));

const PALETTE = ["#FFD166", "#06D6A0", "#EF476F", "#118AB2", "#FF6B6B"];

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hrs: 0, min: 0, seg: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const tick = () => {
      const distance = target - Date.now();
      if (distance < 0) {
        setTimeLeft({ days: 0, hrs: 0, min: 0, seg: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / 86400000),
        hrs: Math.floor((distance % 86400000) / 3600000),
        min: Math.floor((distance % 3600000) / 60000),
        seg: Math.floor((distance % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const blocks = [
    { value: timeLeft.days, label: "DÍAS" },
    { value: timeLeft.hrs, label: "HRS" },
    { value: timeLeft.min, label: "MIN" },
    { value: timeLeft.seg, label: "SEG" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mt-10 mb-6">
      {blocks.map((block, i) => (
        <div key={block.label} className="flex items-center">
          <div className="flex flex-col items-center px-4 md:px-7">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={block.value}
                className="block font-black text-4xl md:text-6xl text-white drop-shadow-md"
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 15, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {String(block.value).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
            <span className="mt-1 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              {block.label}
            </span>
          </div>
          {i < blocks.length - 1 && (
            <div className="h-10 w-px bg-white/30" />
          )}
        </div>
      ))}
    </div>
  );
}

export function HeroBirthday({
  event,
  celebrantName,
  celebrantAge,
  primaryColor,
}: {
  event: any;
  celebrantName: string;
  celebrantAge: number;
  primaryColor: string;
}) {
  const formattedDate = event.eventDate
    ? new Intl.DateTimeFormat("es-MX", {
        day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
      }).format(new Date(event.eventDate)).toUpperCase()
    : "FECHA POR CONFIRMAR";

  const particleColors = [primaryColor, ...PALETTE];

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      {/* Cover image */}
      {event.coverImage ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={event.coverImage}
            alt={event.title || "Cover"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/75" />
        </div>
      ) : (
        <div
          className="absolute inset-0 z-0"
          style={{ background: `linear-gradient(135deg, ${primaryColor}DD 0%, #1A1A2E 100%)` }}
        />
      )}

      {/* Confetti particles */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className={p.isCircle ? "absolute rounded-full" : "absolute rounded-sm"}
            style={{
              width: p.size,
              height: p.height,
              backgroundColor: particleColors[i % particleColors.length],
              top: `${p.top}%`,
              left: `${p.left}%`,
              opacity: p.opacity,
            }}
            animate={{
              y: [0, p.yEnd],
              x: [0, p.xEnd],
              rotate: [0, p.rotateEnd],
              opacity: [0, p.opacity * 1.5, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.p
          className="mb-3 font-bold text-sm md:text-base tracking-[0.35em] text-white/80 uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Te esperamos para celebrar
        </motion.p>

        {/* Age as giant number */}
        <motion.div
          className="font-black leading-none select-none"
          style={{
            fontSize: "clamp(100px, 30vw, 220px)",
            color: primaryColor,
            textShadow: `0 0 80px ${primaryColor}60`,
          }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, type: "spring", damping: 15 }}
        >
          {celebrantAge}
        </motion.div>

        {/* Celebrant name */}
        <motion.h1
          className="font-black text-4xl sm:text-6xl md:text-7xl text-white drop-shadow-lg -mt-4 md:-mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {celebrantName}
        </motion.h1>

        <motion.p
          className="mt-4 font-bold text-base md:text-xl text-white/70 tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {formattedDate}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="w-full"
        >
          {event.eventDate && <Countdown targetDate={event.eventDate} />}
        </motion.div>
      </div>
    </section>
  );
}
