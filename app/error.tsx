"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-[var(--color-midnight)] text-[var(--color-cream)]">
        <div className="mx-auto flex max-w-md flex-col items-center text-center px-4">
          <div className="mb-8 rounded-full bg-white/5 p-6">
            <AlertCircle className="h-16 w-16 text-[var(--color-champagne)]" />
          </div>
          
          <h1 
            className="mb-4 text-4xl font-bold tracking-tight text-[var(--color-cream)] font-serif md:text-5xl"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Algo salió mal
          </h1>
          
          <p className="mb-8 text-lg text-white/70">
            Ocurrió un error inesperado al procesar tu solicitud. Nuestro equipo ha sido notificado.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--color-champagne)] px-8 text-sm font-medium text-[var(--color-champagne)] transition-all hover:bg-[var(--color-champagne)]/10"
            >
              Intentar de nuevo
            </button>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-champagne)] px-8 text-sm font-medium text-[var(--color-midnight)] transition-all hover:bg-[var(--color-champagne)]/90"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
