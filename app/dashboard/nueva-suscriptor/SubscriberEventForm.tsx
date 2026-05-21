"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { createSubscriberEvent, type SubscriberEventInput } from "@/app/actions/client-event";

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
  WEDDING:     { label: "Nombres de los novios",    placeholder: "Ej: María & Juan García" },
  XV:          { label: "Nombre de la quinceañera", placeholder: "Ej: Sofía González" },
  BIRTHDAY:    { label: "¿Quién cumple años?",      placeholder: "Ej: Carlos — 30 años" },
  BABY_SHOWER: { label: "Nombre de la mamá",        placeholder: "Ej: Valentina Reyes" },
  BAPTISM:     { label: "Nombre del bebé",          placeholder: "Ej: Emilio García" },
  GRADUATION:  { label: "Nombre del graduado",      placeholder: "Ej: Andrea López" },
  CORPORATE:   { label: "Nombre del evento",        placeholder: "Ej: Gala Anual 2025" },
  CASUAL:      { label: "Nombre del festejado",     placeholder: "Ej: Fiesta de fin de año" },
};

const TEMPLATES = [
  { slug: "aurora",   name: "Aurora",   emoji: "💍", desc: "Elegante" },
  { slug: "bloom",    name: "Bloom",    emoji: "👑", desc: "Romántico" },
  { slug: "confetti", name: "Confetti", emoji: "🎂", desc: "Festivo" },
  { slug: "nube",     name: "Nube",     emoji: "🍼", desc: "Suave" },
];

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-[var(--color-champagne)] focus:outline-none focus:ring-2 focus:ring-[var(--color-champagne)]/20 transition-all";

export function SubscriberEventForm({ planLabel }: { planLabel: string }) {
  const router = useRouter();
  const [type, setType] = useState<EventTypeValue>("WEDDING");
  const [templateSlug, setTemplateSlug] = useState("aurora");
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const titleConfig = TITLE_LABELS[type];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Escribe el nombre del evento."); return; }
    setError(null);
    startTransition(async () => {
      const payload: SubscriberEventInput = {
        type,
        templateSlug,
        title: title.trim(),
        eventDate: eventDate || undefined,
      };
      const result = await createSubscriberEvent(payload);
      if (result.success && result.eventId) {
        router.push(`/dashboard/mi-invitacion/${result.eventId}`);
      } else {
        setError(result.error ?? "Error al crear el evento.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Tipo de evento */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Tipo de evento
        </p>
        <div className="grid grid-cols-4 gap-2">
          {EVENT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => { setType(t.value); setTitle(""); }}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all ${
                type === t.value
                  ? "border-[var(--color-champagne)] bg-[var(--color-champagne)]/10"
                  : "border-border bg-card hover:border-[var(--color-champagne)]/40"
              }`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-[10px] font-bold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Plantilla */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Plantilla
        </p>
        <div className="grid grid-cols-4 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => setTemplateSlug(t.slug)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all ${
                templateSlug === t.slug
                  ? "border-[var(--color-champagne)] bg-[var(--color-champagne)]/10"
                  : "border-border bg-card hover:border-[var(--color-champagne)]/40"
              }`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-[10px] font-bold">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nombre */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {titleConfig.label}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={titleConfig.placeholder}
          className={inputCls}
        />
      </div>

      {/* Fecha */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Fecha del evento{" "}
          <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
        </label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className={inputCls}
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-midnight)] py-4 text-sm font-bold uppercase tracking-widest text-[var(--color-cream)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Creando…</>
        ) : (
          <>Crear invitación <ArrowRight className="h-4 w-4" /></>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Cubierto por tu plan <strong>{planLabel}</strong> · Sin costo adicional
      </p>
    </form>
  );
}
