"use client";

import { useState, useTransition } from "react";
import { submitChangeRequest } from "@/app/actions/client-event";
import { MessageSquare, Loader2, CheckCircle2, Send } from "lucide-react";

export function ChangeRequestForm({ eventId }: { eventId: string }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitChangeRequest(eventId, text);
      if (result.success) {
        setSent(true);
        setText("");
      } else {
        setError(result.error ?? "Error al enviar");
      }
    });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-6 flex items-start gap-4">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">¡Solicitud enviada!</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
            Nuestro equipo revisará tus cambios y te avisará cuando estén listos. Tiempo estimado: 24–48 horas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center gap-3">
        <MessageSquare className="h-4 w-4 text-[var(--color-champagne)]" />
        <div>
          <h2 className="text-base font-bold">¿Necesitas un cambio?</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Escribe exactamente qué quieres ajustar y lo haremos por ti.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Ej: Cambiar el nombre del salón de 'Jardines del Sol' a 'Hacienda San Miguel'. También actualizar la hora de la ceremonia a las 17:00."
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-[var(--color-champagne)] focus:outline-none focus:ring-2 focus:ring-[var(--color-champagne)]/20 transition-all resize-none"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {text.length}/1000 caracteres · Sé lo más específico posible
          </p>
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-5 py-2.5 text-sm font-bold text-[var(--color-cream)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Enviando…</>
            ) : (
              <><Send className="h-4 w-4" />Enviar solicitud</>
            )}
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
