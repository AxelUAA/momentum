"use client";

import { motion } from "motion/react";

export function AuroraBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Warm midnight blue — depth */}
      <motion.div
        className="absolute -top-40 -left-32 h-[700px] w-[700px] rounded-full blur-3xl"
        style={{ backgroundColor: "#1B3A5C", opacity: 0.45 }}
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 70, 0], scale: [1, 1.1, 0.92, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Champagne gold — warm glow */}
      <motion.div
        className="absolute -top-20 right-0 h-[600px] w-[600px] rounded-full blur-3xl"
        style={{ backgroundColor: "#D4AF7A", opacity: 0.18 }}
        animate={{ x: [0, -80, 35, 0], y: [0, 55, -35, 0], scale: [1, 0.88, 1.18, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      {/* Dusty rose — aurora accent */}
      <motion.div
        className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full blur-3xl"
        style={{ backgroundColor: "#C9A8A0", opacity: 0.14 }}
        animate={{ x: [0, 45, -60, 0], y: [0, -50, 25, 0], scale: [1, 1.22, 0.88, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />
      {/* Secondary champagne — lower warmth */}
      <motion.div
        className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full blur-3xl"
        style={{ backgroundColor: "#D4AF7A", opacity: 0.09 }}
        animate={{ x: [0, -40, 30, 0], y: [0, 40, -30, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 15 }}
      />
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,175,122,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,122,0.025) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 0%, transparent 40%, rgba(10,18,32,0.7) 100%)",
        }}
      />
    </div>
  );
}
