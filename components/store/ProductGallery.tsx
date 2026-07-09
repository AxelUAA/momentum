"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  badge,
}: {
  images: string[];
  name: string;
  badge?: React.ReactNode;
}) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? images[0];

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
        {current ? (
          <img
            src={current}
            alt={name}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        {badge}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((image, i) => (
            <button
              key={image}
              onClick={() => setSelected(i)}
              aria-label={`Ver foto ${i + 1} de ${name}`}
              className={cn(
                "cursor-pointer overflow-hidden rounded-2xl border transition-colors duration-200",
                i === selected
                  ? "border-accent"
                  : "border-border opacity-70 hover:opacity-100"
              )}
            >
              <img
                src={image}
                alt=""
                aria-hidden
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
