"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col items-center px-4 text-center">
        <div className="mb-8 rounded-full bg-accent/10 p-6">
          <AlertCircle className="h-16 w-16 text-accent" />
        </div>
        <h1 className="mb-4 font-heading text-4xl uppercase tracking-tight md:text-5xl">
          Algo salió mal
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Ocurrió un error inesperado. Intenta de nuevo o vuelve al inicio.
        </p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="cursor-pointer rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors duration-200 hover:bg-accent/90"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-muted"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
