"use client";

import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-border bg-card text-card-foreground p-8">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <h2 className="mb-3 text-2xl font-bold tracking-tight">
          Error al cargar el dashboard
        </h2>
        
        <p className="mb-6 text-sm text-muted-foreground">
          Ha ocurrido un problema técnico mientras intentábamos procesar esta vista.
          Detalle: {error.message || "Error desconocido"}
        </p>
        
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--color-brand)] px-6 text-sm font-medium text-[var(--color-midnight)] transition-all hover:opacity-90"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
