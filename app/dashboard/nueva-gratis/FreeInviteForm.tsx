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
  { value: "WEDDING",     Icon: Heart,          label: "Boda",        desc: "Ceremonia matrimonial" },
  { value: "XV",          Icon: Crown,          label: "XV Años",     desc: "Quinceañera" },
  { value: "BIRTHDAY",    Icon: Cake,           label: "Cumpleaños",  desc: "Celebración" },
  { value: "BABY_SHOWER", Icon: Baby,           label: "Baby Shower", desc: "Llegada del bebé" },
  { value: "BAPTISM",     Icon: Droplets,       label: "Bautizo",     desc: "Sacramento" },
  { value: "GRADUATION",  Icon: GraduationCap,  label: "Graduación",  desc: "Ceremonia" },
  { value: "CORPORATE",   Icon: Building2,      label: "Corporativo", desc: "Evento de empresa" },
  { value: "CASUAL",      Icon: PartyPopper,    label: "Celebración", desc: "Evento especial" },
];

type TypeConfig = {
  titleLabel: string;
  titlePlaceholder: string;
  locationLabel: string;
  bioLabel: string;
  bioPlaceholder: string;
  funFactLabel?: string;
  funFactPlaceholder?: string;
};

const TYPE_CONFIG: Record<string, TypeConfig> = {
  WEDDING: {
    titleLabel: "Nombres de los novios",
    titlePlaceholder: "María y Juan García",
    locationLabel: "Lugar de la ceremonia o recepción",
    bioLabel: "Historia de los novios",
    bioPlaceholder: "¿Cómo se conocieron? ¿Cuándo fue la propuesta? Cuéntanos su historia…",
    funFactLabel: "Un dato curioso de la pareja",
    funFactPlaceholder: "Ej: Se conocieron en un viaje a Oaxaca",
  },
  XV: {
    titleLabel: "Nombre de la quinceañera",
    titlePlaceholder: "Sofía González",
    locationLabel: "Lugar del evento",
    bioLabel: "Mensaje de la quinceañera",
    bioPlaceholder: "Un mensaje especial o lo que quieres compartir con tus invitados…",
    funFactLabel: "Un dato curioso",
    funFactPlaceholder: "Ej: Su color favorito es el azul marino",
  },
  BIRTHDAY: {
    titleLabel: "¿Quién cumple años?",
    titlePlaceholder: "Carlos — 30 años",
    locationLabel: "Lugar de la fiesta",
    bioLabel: "Mensaje del festejado",
    bioPlaceholder: "Una reflexión o lo que quieras que lean tus invitados…",
    funFactLabel: "Un dato curioso",
    funFactPlaceholder: "Ej: Le encanta la fotografía desde los 12 años",
  },
  BABY_SHOWER: {
    titleLabel: "Nombres de los papás",
    titlePlaceholder: "Ana y Roberto Martínez",
    locationLabel: "Lugar del evento",
    bioLabel: "Mensaje de los papás",
    bioPlaceholder: "¿Cómo se sienten? ¿Algo especial sobre la llegada del bebé?…",
  },
  BAPTISM: {
    titleLabel: "Nombre del bebé",
    titlePlaceholder: "Valentina García",
    locationLabel: "Lugar del bautizo",
    bioLabel: "Mensaje para los invitados",
    bioPlaceholder: "Palabras de bienvenida o el significado de este día para tu familia…",
  },
  GRADUATION: {
    titleLabel: "Nombre del graduado",
    titlePlaceholder: "Andrés López — Ingeniería Civil",
    locationLabel: "Lugar de la ceremonia",
    bioLabel: "Mensaje del graduado",
    bioPlaceholder: "Tu reflexión sobre este logro, agradecimientos, o lo que viene…",
    funFactLabel: "Un logro o dato curioso",
    funFactPlaceholder: "Ej: Estudió con beca completa los 5 años",
  },
  CORPORATE: {
    titleLabel: "Nombre del evento",
    titlePlaceholder: "Conferencia Anual 2026 — TechCorp",
    locationLabel: "Lugar del evento",
    bioLabel: "Descripción del evento",
    bioPlaceholder: "De qué trata el evento, qué se celebra o los objetivos del encuentro…",
  },
  CASUAL: {
    titleLabel: "Nombre de la celebración",
    titlePlaceholder: "Despedida de Soltero — Mario",
    locationLabel: "Lugar del evento",
    bioLabel: "¿De qué va la celebración?",
    bioPlaceholder: "Cuéntanos sobre el evento y lo que quieres que sepan tus invitados…",
  },
};

const DEFAULT_CONFIG: TypeConfig = {
  titleLabel: "Nombre del evento",
  titlePlaceholder: "Mi evento especial",
  locationLabel: "Lugar del evento",
  bioLabel: "Descripción",
  bioPlaceholder: "Cuéntanos más sobre tu evento…",
};

const TYPES_WITH_FUNFACT = new Set(["WEDDING", "XV", "BIRTHDAY", "GRADUATION"]);

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
  hint,
  children,
}: {
  label: string;
  tag?: "required" | "optional";
  hint?: string;
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
        {tag === "optional" && (
          <span className="shrink-0 text-[10px] text-muted-foreground/30">opcional</span>
        )}
      </div>
      {children}
      {hint && (
        <p className="text-[11px] leading-relaxed text-muted-foreground/40">{hint}</p>
      )}
    </div>
  );
}

// ─── Step 1 — TypePicker ──────────────────────────────────────────────────────

function TypePicker({ onSelect }: { onSelect: (type: string) => void }) {
  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Grid */}
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
              "hover:border-[var(--color-champagne)]/50 hover:bg-[var(--color-champagne)]/[0.05]",
              "hover:shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-champagne)]/40",
            ].join(" ")}
          >
            {/* Icon container */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/70 transition-all duration-200 group-hover:bg-[var(--color-champagne)]/12">
              <Icon className="h-6 w-6 text-muted-foreground/60 transition-all duration-200 group-hover:text-[var(--color-champagne)]" />
            </div>

            {/* Labels */}
            <div className="space-y-0.5">
              <p className="text-[13px] font-semibold leading-tight text-foreground">
                {label}
              </p>
              <p className="text-[10px] leading-tight text-muted-foreground/45">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2 — Event form ──────────────────────────────────────────────────────

export function FreeInviteForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [bio, setBio] = useState("");
  const [funFact, setFunFact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const config = TYPE_CONFIG[type] ?? DEFAULT_CONFIG;
  const hasFunFact = TYPES_WITH_FUNFACT.has(type);
  const selectedType = EVENT_TYPES.find((t) => t.value === type);

  function handleTypeSelect(t: string) {
    setType(t);
    setTitle("");
    setBio("");
    setFunFact("");
    setStep(2);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const data: FreeInviteInput = {
        type: type as FreeInviteInput["type"],
        title: title.trim(),
        eventDate: eventDate || undefined,
        locationName: locationName.trim() || undefined,
        bio: bio.trim() || undefined,
        funFact: hasFunFact && funFact.trim() ? funFact.trim() : undefined,
      };
      const result = await createFreeInvitation(data);
      if (result.success && result.eventId) {
        router.push(`/dashboard/mi-invitacion/${result.eventId}`);
      } else {
        setError(result.error ?? "Ocurrió un error. Intenta de nuevo.");
      }
    });
  }

  // ── Step 1 ─────────────────────────────────────────────────────────────────
  if (step === 1) {
    return <TypePicker onSelect={handleTypeSelect} />;
  }

  // ── Step 2 ─────────────────────────────────────────────────────────────────
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
            <p className="text-xs font-bold text-[var(--color-champagne)]">
              {selectedType?.label}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/50">
              Los campos están personalizados para este tipo de evento
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

        {/* Title */}
        <Field label={config.titleLabel} tag="required">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={config.titlePlaceholder}
            required
            maxLength={150}
            className={inputCls}
            autoFocus
          />
        </Field>

        {/* Date + Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha del evento" tag="optional">
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label={config.locationLabel} tag="optional">
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Salón Jardín, Ciudad de México"
              maxLength={200}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Bio */}
        <Field
          label={config.bioLabel}
          tag="optional"
          hint="Este texto se usará para crear el contenido de tu invitación."
        >
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder={config.bioPlaceholder}
            maxLength={500}
            className={`${inputCls} resize-none`}
          />
          <p className="mt-1.5 text-right font-mono text-[10px] text-muted-foreground/25 tabular-nums">
            {bio.length} / 500
          </p>
        </Field>

        {/* Fun fact */}
        {hasFunFact && (
          <Field label={config.funFactLabel!} tag="optional">
            <input
              type="text"
              value={funFact}
              onChange={(e) => setFunFact(e.target.value)}
              placeholder={config.funFactPlaceholder}
              maxLength={300}
              className={inputCls}
            />
          </Field>
        )}

        {/* Error */}
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
                className={`flex items-center gap-2 text-xs ${
                  ok ? "text-foreground/65" : "text-muted-foreground/35"
                }`}
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

        {/* Submit */}
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
    </div>
  );
}
