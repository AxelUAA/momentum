"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, ArrowRight, ArrowLeft, Check, X,
  Heart, Crown, Cake, Baby, Droplets, GraduationCap, Building2, PartyPopper,
  type LucideIcon,
} from "lucide-react";
import { createFreeInvitation, type FreeInviteInput } from "@/app/actions/client-event";

// ─── Data ─────────────────────────────────────────────────────────────────────

const EVENT_TYPES: { value: string; Icon: LucideIcon; label: string; desc: string }[] = [
  { value: "WEDDING",     Icon: Heart,         label: "Boda",        desc: "Ceremonia matrimonial" },
  { value: "XV",          Icon: Crown,         label: "XV Años",     desc: "Quinceañera" },
  { value: "BIRTHDAY",    Icon: Cake,          label: "Cumpleaños",  desc: "Celebración" },
  { value: "BABY_SHOWER", Icon: Baby,          label: "Baby Shower", desc: "Llegada del bebé" },
  { value: "BAPTISM",     Icon: Droplets,      label: "Bautizo",     desc: "Sacramento" },
  { value: "GRADUATION",  Icon: GraduationCap, label: "Graduación",  desc: "Ceremonia" },
  { value: "CORPORATE",   Icon: Building2,     label: "Corporativo", desc: "Evento de empresa" },
  { value: "CASUAL",      Icon: PartyPopper,   label: "Celebración", desc: "Evento especial" },
];

const TYPE_LABELS: Record<string, { label: string; placeholder: string }> = {
  WEDDING:     { label: "Nombres de los novios",    placeholder: "María y Juan García" },
  XV:          { label: "Nombre de la quinceañera", placeholder: "Sofía González" },
  BIRTHDAY:    { label: "¿Quién cumple años?",      placeholder: "Carlos — 30 años" },
  BABY_SHOWER: { label: "Nombres de los papás",     placeholder: "Ana y Roberto Martínez" },
  BAPTISM:     { label: "Nombre del bebé",          placeholder: "Valentina García" },
  GRADUATION:  { label: "Nombre del graduado",      placeholder: "Andrés López — Ingeniería Civil" },
  CORPORATE:   { label: "Nombre del evento",        placeholder: "Conferencia Anual 2026 — TechCorp" },
  CASUAL:      { label: "Nombre de la celebración", placeholder: "Despedida de Soltero — Mario" },
};

const DEFAULT_LABEL = { label: "Nombre del evento", placeholder: "Mi evento especial" };

// ─── Primitives ───────────────────────────────────────────────────────────────

const inputCls = [
  "w-full rounded-xl border border-border/70 bg-background/60 px-4 py-3.5 text-sm text-foreground",
  "placeholder:text-muted-foreground/30 backdrop-blur-sm",
  "transition-all duration-200",
  "focus:border-[var(--color-champagne)]/50 focus:bg-background focus:outline-none",
  "focus:ring-2 focus:ring-[var(--color-champagne)]/15",
].join(" ");

function Field({
  label,
  tag,
  children,
}: {
  label: string;
  tag?: "required";
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/55">
          {label}
        </label>
        {tag === "required" && (
          <span className="shrink-0 text-[10px] font-semibold text-[var(--color-champagne)]/80">
            requerido
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Step 1 — TypePicker ──────────────────────────────────────────────────────

function TypePicker({ onSelect }: { onSelect: (type: string) => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-champagne)]">
          Paso 1 de 2
        </p>
        <h2
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          ¿Qué tipo de evento es?
        </h2>
        <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-muted-foreground">
          Selecciona para personalizar los campos de tu invitación
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {EVENT_TYPES.map(({ value, Icon, label, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={[
              "group flex cursor-pointer flex-col items-center gap-3.5 rounded-2xl border border-border/60",
              "bg-card p-5 text-center",
              "transition-all duration-200 active:scale-[0.97]",
              "hover:border-[var(--color-champagne)]/50 hover:bg-[var(--color-champagne)]/[0.05] hover:shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-champagne)]/40",
            ].join(" ")}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/70 transition-all duration-200 group-hover:bg-[var(--color-champagne)]/12">
              <Icon className="h-6 w-6 text-muted-foreground/60 transition-all duration-200 group-hover:text-[var(--color-champagne)]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[13px] font-semibold leading-tight text-foreground">{label}</p>
              <p className="text-[10px] leading-tight text-muted-foreground/45">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2 — Title only ──────────────────────────────────────────────────────

export function FreeInviteForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cfg = TYPE_LABELS[type] ?? DEFAULT_LABEL;
  const selectedType = EVENT_TYPES.find((t) => t.value === type);

  function handleTypeSelect(t: string) {
    setType(t);
    setTitle("");
    setStep(2);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const data: FreeInviteInput = {
        type: type as FreeInviteInput["type"],
        title: title.trim(),
      };
      const result = await createFreeInvitation(data);
      if (result.success && result.eventId) {
        router.push(`/dashboard/mi-invitacion/${result.eventId}`);
      } else {
        setError(result.error ?? "Ocurrió un error. Intenta de nuevo.");
      }
    });
  }

  if (step === 1) return <TypePicker onSelect={handleTypeSelect} />;

  const SelectedIcon = selectedType?.Icon;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-7">

      {/* Step nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={[
            "group inline-flex cursor-pointer items-center gap-2 text-sm",
            "text-muted-foreground transition-colors duration-200 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-champagne)]/40 rounded-lg px-1",
          ].join(" ")}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted/60 transition-colors duration-200 group-hover:bg-muted">
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          Cambiar tipo
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
          Paso 2 de 2
        </p>
      </div>

      {/* Selected-type badge */}
      {SelectedIcon && (
        <div className="flex items-center gap-3.5 rounded-2xl border border-[var(--color-champagne)]/20 bg-[var(--color-champagne)]/[0.04] px-4 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-champagne)]/12">
            <SelectedIcon className="h-5 w-5 text-[var(--color-champagne)]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[var(--color-champagne)]">{selectedType?.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/50">
              El resto de los detalles los completas en el siguiente paso
            </p>
          </div>
        </div>
      )}

      {/* Champagne divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-champagne)]/15" />
        <div className="h-1 w-1 rounded-full bg-[var(--color-champagne)]/30" />
        <div className="h-px flex-1 bg-[var(--color-champagne)]/15" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label={cfg.label} tag="required">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={cfg.placeholder}
            required
            maxLength={150}
            className={inputCls}
            autoFocus
          />
        </Field>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Includes */}
        <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/30 px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
            Qué incluye
          </p>
          <div className="grid gap-y-2 gap-x-4 sm:grid-cols-2">
            {[
              { ok: true,  text: "Invitación digital personalizada" },
              { ok: true,  text: "RSVP digital (hasta 30 invitados)" },
              { ok: true,  text: "Link único por invitado" },
              { ok: false, text: "Sin galería de fotos ni música" },
              { ok: false, text: "Activación en 24–48 h" },
            ].map(({ ok, text }) => (
              <div
                key={text}
                className={`flex items-center gap-2 text-xs ${ok ? "text-foreground/65" : "text-muted-foreground/35"}`}
              >
                {ok
                  ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  : <X className="h-3.5 w-3.5 shrink-0" />
                }
                {text}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className={[
            "shimmer w-full inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5",
            "rounded-xl border-none px-6 text-sm font-bold text-[var(--color-midnight)]",
            "transition-all duration-200 hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-champagne)]/50 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-40",
          ].join(" ")}
        >
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creando tu invitación…</>
          ) : (
            <>Crear mi invitación gratis <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>
    </div>
  );
}
