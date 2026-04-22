"use client";

import { motion, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export function Spotlight() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setOpacity(1);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Use a slight spring for smooth following
  const springX = useSpring(position.x, { stiffness: 100, damping: 20 });
  const springY = useSpring(position.y, { stiffness: 100, damping: 20 });

  useEffect(() => {
    springX.set(position.x);
    springY.set(position.y);
  }, [position, springX, springY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute -inset-px rounded-full bg-gradient-to-r from-transparent via-[#D4AF7A] to-transparent opacity-0 mix-blend-screen blur-3xl transition-opacity duration-300 dark:via-[#D4AF7A]"
        style={{
          width: "400px",
          height: "400px",
          x: springX,
          y: springY,
          marginLeft: "-200px",
          marginTop: "-200px",
          opacity: opacity ? 0.08 : 0,
        }}
      />
    </motion.div>
  );
}
