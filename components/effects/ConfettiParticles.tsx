"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function ConfettiParticles() {
  const [particles, setParticles] = useState<
    { id: number; x: number; delay: number; duration: number; size: number; isRose: boolean }[]
  >([]);

  useEffect(() => {
    // Generate fewer particles on mobile to improve performance
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? Math.floor(Math.random() * 5) + 10 : Math.floor(Math.random() * 20) + 30;
    
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // random x position (vw)
      delay: Math.random() * 10, // random start delay
      duration: Math.random() * 15 + 15, // fall duration between 15-30s
      size: Math.random() * 6 + 4, // size between 4-10px
      isRose: Math.random() > 0.6, // 40% chance of being dusty rose, 60% champagne
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-[-5%]"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.5,
            backgroundColor: p.isRose ? "var(--color-dusty-rose)" : "var(--color-champagne)",
            borderRadius: "2px",
            opacity: 0.4,
            willChange: "transform",
          }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [0, 360, 720],
            opacity: [0, 0.6, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
