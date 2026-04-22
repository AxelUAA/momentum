import React from "react";

export interface LogoProps {
  variant?: "onDark" | "onLight" | "mono-dark" | "mono-light";
  showWordmark?: boolean;
  className?: string;
}

export function Logo({ variant = "onLight", showWordmark = true, className = "" }: LogoProps) {
  let symbolColor = "";
  let textColor = "";

  switch (variant) {
    case "onDark":
      symbolColor = "text-[var(--color-champagne)]";
      textColor = "text-[var(--color-champagne)]";
      break;
    case "onLight":
      symbolColor = "text-[var(--color-midnight)]";
      textColor = "text-[var(--color-midnight)]";
      break;
    case "mono-dark":
      symbolColor = "text-[var(--color-midnight)]";
      textColor = "text-[var(--color-midnight)]";
      break;
    case "mono-light":
      symbolColor = "text-[var(--color-cream)]";
      textColor = "text-[var(--color-cream)]";
      break;
  }

  return (
    <div className={`flex items-center gap-[0.6em] ${className}`}>
      <svg
        viewBox="0 0 140 110"
        className={`h-[1.6em] w-auto ${symbolColor} fill-none stroke-current`}
        strokeWidth="11"
        strokeLinecap="butt"
        role="img"
        aria-label="Momentum"
      >
        <path d="M 12 82 C 40 5, 100 15, 130 100" />
        <path d="M 32 82 C 55 35, 90 40, 110 100" />
        <path d="M 52 82 C 65 58, 80 62, 90 100" />
      </svg>
      {showWordmark && (
        <span 
          className={`font-sans font-semibold tracking-[0.05em] leading-none select-none ${textColor}`}
          style={{ fontSize: "1em" }}
        >
          MOMENTUM
        </span>
      )}
    </div>
  );
}
