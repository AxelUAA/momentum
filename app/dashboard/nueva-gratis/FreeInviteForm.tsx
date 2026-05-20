"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { createFreeInvitation, type FreeInviteInput } from "@/app/actions/client-event";

// ─── Event types ──────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  { value: "WEDDING",     emoji: "💍", label: "Boda" },
  { value: "XV",          emoji: "👑", label: "XV Años" },
  { value: "BIRTHDAY",    emoji: "🎂", label: "Cumpleaños" },
  { value: "BABY_SHOWER", emoji: "🍼", label: "Baby Shower" },
  { value: "BAPTISM",     emoji: "🕊️", label: "Bautizo" },
  { value: "GRADUATION",  emoji: "🎓", label: "Graduación" },
  { value: "CORPORATE",   emoji: "🏢", label: "Corporativo" },
  { value: "CASUAL",      emoji: "🎈", label: "Celebración" },
] as const;

type EventTypeValue = typeof EVENT_TYPES[number]["value"];

const TITLE_LABELS: Record<EventTypeValue, { label: string; placeholder: string }> = {
  WEDDING:    { label: "Nombres de los novios",         placeholder: "María y Juan García" },
  XV:         { label: "Nombre de la quinceañera",      placeholder: "Sofía González" },
  BIRTHDAY:   { label: "¿Quién cumple años?",           placeholder: "Carlos — 30 años" },
  BABY_SHOWER:{ label: "Nombre de la mamá",             placeholder: "Valentina Reyes" },
  BAPTISM:    { label: "Nombre del bebé",               placeholder: "Emilio García" },
  GRADUATION: { label: "Nombre del graduado",           placeholder: "Andrea López — Medicina" },
  CORPORATE:  { label: "Nombre del evento",             placeholder: "Gala Anual 2025" },
  CASUAL:     { label: "Nombre del festejado / evento", placeholder: "Fiesta de fin de año" },
};

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-[var(--color-champagne)] focus:outline-none focus:ring-2 focus:ring-[var(--color-champagne)]/20 transition-all";

// ─── Form ─────────────────────────────────────────────────────────────────────

export function FreeInviteForm() {
  const router = useRouter();
  const [type, setType] = useState<EventTypeValue>("WEDDING");
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const titleConfig = TITLE_LABELS[type];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Por favor escribe el nombre del evento."); return; }
    setError(null);
    startTransition(async () => {
      const data: FreeInviteInput = {
        type,
        title: title.trim(),
        eventDate: eventDate || undefined,
        locationName: locationName.trim() || undefined,
      };
      const result = await createFreeInvitation(data);
      if (result.success && result.eventId) {
        router.push(`/dashboard/mi-invitacion/${result.eventId}`);
      } else {
        setError(result.error ?? "Error al crear la invitación");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Event type selector */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Tipo de evento
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {EVENT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all ${
                type === t.value
                  ? "border-[var(--color-champagne)] bg-[var(--color-champagne)]/10"
                  : "border-border bg-card hover:border-[var(--color-champagne)]/40"
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="text-[10px] font-semibold leading-tight text-foreground">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Details */}
      <div className="space-y-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Datos del evento
        </p>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {titleConfig.label}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={titleConfig.placeholder}
            required
            className={inputCls}
          />
          <p className="text-[11px] text-muted-foreground/60">
            Así aparecerá en tu invitación. Puedes editarlo después.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fecha del evento
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputCls}
            />
            <p className="text-[11px] text-muted-foreground/60">Opcional — puedes agregarlo después</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lugar
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Ej: Salón Jardines del Sol"
              className={inputCls}
            />
            <p className="text-[11px] text-muted-foreground/60">Opcional — puedes agregarlo después</p>
          </div>
        </div>
      </div>

      {/* Free limits reminder */}
      <div className="rounded-xl bg-muted/50 border border-border px-4 py-4 text-sm space-y-1">
        <p className="font-semibold">Qué incluye la invitación gratis</p>
        <ul className="text-muted-foreground text-xs space-y-1 mt-2">
          <li>✓ Invitación digital con tu información básica</li>
          <li>✓ RSVP digital para tus invitados (hasta 20)</li>
          <li>✓ Link personalizado por invitado</li>
          <li className="text-muted-foreground/50">✗ Sin galería de fotos, música, ni cuenta regresiva</li>
          <li className="text-muted-foreground/50">✗ El admin revisa y activa (puede tardar 24–48 h)</li>
        </ul>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-midnight)] px-6 py-4 text-sm font-bold uppercase tracking-widest text-[var(--color-cream)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creando tu invitación…
          </>
        ) : (
          <>
            Crear mi invitación gratis
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
