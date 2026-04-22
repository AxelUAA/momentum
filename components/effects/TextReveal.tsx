"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ text, className, delay = 0 }: TextRevealProps) {
  // Split the text into words
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: delay * i },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <motion.h1
      className={cn("flex flex-wrap items-center justify-center gap-x-2 md:gap-x-3", className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => {
        // Apply special styling to the word "celebrado"
        if (word.toLowerCase().includes("celebrado")) {
          return (
            <motion.span
              variants={child}
              key={index}
              className="text-gradient-champagne font-bold"
            >
              {word}
            </motion.span>
          );
        }
        return (
          <motion.span variants={child} key={index} className="inline-block">
            {word}
          </motion.span>
        );
      })}
    </motion.h1>
  );
}
