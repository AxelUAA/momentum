"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ── Live Countdown Sub-component ── */
function Countdown() {
  const [time, setTime] = useState({ days: 54, hrs: 12, min: 34, seg: 21 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { days, hrs, min, seg } = prev;
        seg -= 1;
        if (seg < 0) {
          seg = 59;
          min -= 1;
        }
        if (min < 0) {
          min = 59;
          hrs -= 1;
        }
        if (hrs < 0) {
          hrs = 23;
          days -= 1;
        }
        if (days < 0) {
          return { days: 54, hrs: 12, min: 34, seg: 21 };
        }
        return { days, hrs, min, seg };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const blocks = [
    { value: time.days, label: "DÍAS" },
    { value: time.hrs, label: "HRS" },
    { value: time.min, label: "MIN" },
    { value: time.seg, label: "SEG" },
  ];

  return (
    <div className="flex w-full items-center justify-center gap-0">
      {blocks.map((block, i) => (
        <div key={block.label} className="flex items-center">
          <div className="flex flex-col items-center px-2.5">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={block.value}
                className="block font-heading text-xl text-[var(--color-midnight)] dark:text-[var(--color-cream)]"
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {String(block.value).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
            <span className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">
              {block.label}
            </span>
          </div>
          {i < blocks.length - 1 && (
            <div className="h-7 w-px bg-[var(--color-champagne)] opacity-30" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Phone Mockup ── */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[300px] sm:w-[320px] lg:ml-auto lg:mr-0">
      {/* Glow around phone */}
      <div className="absolute -inset-4 z-0 rounded-full bg-[var(--color-champagne)] opacity-20 blur-3xl glow-champagne-strong" />

      {/* iPhone Frame */}
      <motion.div
        className="relative z-10 mx-auto aspect-[9/19.5] w-full rounded-[48px] border-[8px] border-zinc-800 bg-black p-2 shadow-2xl ring-1 ring-white/10 dark:border-zinc-900"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Notch / Dynamic Island */}
        <div className="absolute left-1/2 top-3 z-30 h-6 w-20 -translate-x-1/2 rounded-full bg-black" />

        {/* Screen Content Wrapper */}
        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#FAF7F2] dark:bg-[#0A1220]">
          {/* 
             Animation Sequence 
             Using keyframes for a 9-second loop
          */}
          
          {/* Phase 1 & 2: Envelope opening (0-3s) */}
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1B3A5C]"
            animate={{ opacity: [1, 1, 0, 0, 0] }}
            transition={{ duration: 9, times: [0, 0.25, 0.35, 0.95, 1], repeat: Infinity }}
          >
            {/* Envelope Body */}
            <motion.div
              className="relative flex h-32 w-48 items-center justify-center rounded-sm bg-[#D4AF7A] shadow-xl"
              animate={{ y: [0, 0, 200, 200, 0] }}
              transition={{ duration: 9, times: [0, 0.25, 0.35, 0.95, 1], repeat: Infinity }}
            >
              {/* Envelope Flap */}
              <motion.div
                className="absolute left-0 top-0 h-0 w-0 border-l-[96px] border-r-[96px] border-t-[64px] border-l-transparent border-r-transparent border-t-[#C49A60] origin-top"
                animate={{ rotateX: [0, 0, 180, 180, 0] }}
                transition={{ duration: 9, times: [0, 0.22, 0.3, 0.95, 1], repeat: Infinity }}
              />
              {/* Wax Seal */}
              <motion.div
                className="absolute z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#9B3A4E] shadow-md"
                animate={{ opacity: [1, 1, 0, 0, 1] }}
                transition={{ duration: 9, times: [0, 0.2, 0.22, 0.95, 1], repeat: Infinity }}
              >
                <span className="font-display text-white">M&J</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Phase 3, 4 & 5: Paper content (3-9s) */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center p-6 text-center"
            animate={{ opacity: [0, 0, 1, 1, 0], y: [100, 100, 0, 0, 0] }}
            transition={{ duration: 9, times: [0, 0.25, 0.35, 0.95, 1], repeat: Infinity }}
          >
            {/* Floral SVG placeholder */}
            <svg className="absolute left-0 top-0 opacity-10" width="100%" height="200" viewBox="0 0 200 200">
              <path d="M100,0 C120,50 180,80 200,100 C180,120 120,150 100,200 C80,150 20,120 0,100 C20,80 80,50 100,0 Z" fill="var(--color-champagne)" />
            </svg>

            {/* Names & Date (Frame 3-5s) */}
            <motion.div
              className="mt-16 flex flex-col items-center gap-2"
              animate={{ opacity: [0, 0, 1, 1, 0] }}
              transition={{ duration: 9, times: [0, 0.3, 0.4, 0.95, 1], repeat: Infinity }}
            >
              <h3 className="font-display text-4xl text-[var(--color-midnight)] dark:text-[var(--color-cream)]">
                María & Juan
              </h3>
              <p className="font-sans text-sm tracking-widest text-[var(--color-dusty-rose)]">
                14 JUNIO 2026
              </p>
            </motion.div>

            {/* Countdown (Frame 5-7s) — 4 live blocks */}
            <motion.div
              className="mt-10 w-full border-y border-[var(--color-champagne)] py-3"
              animate={{ opacity: [0, 0, 0, 1, 1, 0], scale: [0.9, 0.9, 0.9, 1, 1, 0.9] }}
              transition={{ duration: 9, times: [0, 0.45, 0.5, 0.55, 0.95, 1], repeat: Infinity }}
            >
              <Countdown />
            </motion.div>

            {/* RSVP Button (Frame 7-9s) */}
            <motion.div
              className="absolute bottom-12 w-full px-6"
              animate={{ opacity: [0, 0, 0, 0, 1, 1, 0], y: [20, 20, 20, 20, 0, 0, 20] }}
              transition={{ duration: 9, times: [0, 0.65, 0.7, 0.75, 0.8, 0.95, 1], repeat: Infinity }}
            >
              <motion.button
                className="w-full rounded-full bg-[var(--color-champagne)] py-3 font-medium text-[var(--color-midnight)] shadow-lg"
                animate={{ scale: [1, 1, 1, 1, 1, 1.05, 1] }}
                transition={{ duration: 9, times: [0, 0.8, 0.85, 0.9, 0.92, 0.95, 1], repeat: Infinity }}
              >
                Confirmar asistencia
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
