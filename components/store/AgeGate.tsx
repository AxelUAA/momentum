"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "momentum-age-verified";

export function AgeGate() {
  const [status, setStatus] = useState<"loading" | "hidden" | "asking" | "denied">(
    "loading"
  );

  useEffect(() => {
    setStatus(localStorage.getItem(STORAGE_KEY) === "1" ? "hidden" : "asking");
  }, []);

  useEffect(() => {
    if (status !== "asking" && status !== "denied") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [status]);

  if (status === "loading" || status === "hidden") return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Verificación de edad"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4 backdrop-blur-xl"
    >
      <div className="glow-gold w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center sm:p-10">
        <p className="font-heading text-6xl uppercase text-accent">18+</p>

        {status === "asking" ? (
          <>
            <h2 className="mt-4 font-heading text-2xl uppercase tracking-wide">
              ¿Eres mayor de edad?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Este sitio muestra productos con nicotina, exclusivos para mayores
              de 18 años. La nicotina es una sustancia adictiva.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  localStorage.setItem(STORAGE_KEY, "1");
                  setStatus("hidden");
                }}
                className="flex-1 cursor-pointer rounded-full bg-accent px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-accent-foreground transition-colors duration-200 hover:bg-gold-deep"
              >
                Sí, soy mayor de 18
              </button>
              <button
                onClick={() => setStatus("denied")}
                className="flex-1 cursor-pointer rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-muted"
              >
                No
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="mt-4 font-heading text-2xl uppercase tracking-wide">
              Acceso restringido
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Este contenido es solo para mayores de edad. Vuelve cuando cumplas
              18 años.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
