"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, ArrowRight, ArrowLeft, Check, X,
  Heart, Crown, Cake, Baby, Droplets, GraduationCap, Building2, PartyPopper,
  type LucideIcon,
} from "lucide-react";
import { createFreeInvitation, type FreeInviteInput } from "@/app/actions/client-event";

// ─── Event types ──────────────────────────────────────────────────────────────

const EVENT_TYPES: { value: string; Icon: LucideIcon; label: string; desc: string }[] = [
  { value: "WEDDING",     Icon: Heart,          label: "Boda",        desc: "Ceremonia matrimonial" },
  { value: "XV",          Icon: Crown,          label: "XV Años",     desc: "Quinceañera" },
  { value: "BIRTHDAY",    Icon: Cake,           label: "Cumpleaños",  desc: "Celebración de cumpleaños" },
  { value: "BABY_SHOWER", Icon: Baby,           label: "Baby Shower", desc: "Llegada del bebé" },
  { value: "BAPTISM",     Icon: Droplets,       label: "Bautizo",     desc: "Sacramento del bautismo" },
  { value: "GRADUATION",  Icon: GraduationCap,  label: "Graduación",  desc: "Ceremonia de graduación" },
  { value: "CORPORATE",   Icon: Building2,      label: "Corporativo", desc: "Evento de empresa" },
  { value: "CASUAL",      Icon: PartyPopper,    label: "Celebración", desc: "Otra celebración especial" },
];

// ─── Per-type form config ──────────────────────────────────────────────────────

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

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-champagne)]/40 transition-all";
const labelCls =
  "block text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5";

// ─── Step 1: TypePicker ────────────────────────────────────────────────────────

function TypePicker({ onSelect }: { onSelect: (type: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          ¿Qué tipo de evento es?
        </h2>
        <p className="text-sm text-muted-foreground">
          Selecciona para personalizar tu invitación
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {EVENT_TYPES.map(({ value, Icon, label, desc }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center hover:border-[var(--color-champagne)]/60 hover:bg-[var(--color-champagne)]/5 transition-all active:scale-95"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted group-hover:bg-[var(--color-champagne)]/10 transition-colors">
              <Icon className="h-6 w-6 text-muted-foreground group-hover:text-[var(--color-champagne)] transition-colors" />
            </div>
            <div>
              <p className="text-sm font-bold">{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: EventForm ────────────────────────────────────────────────────────

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

  if (step === 1) {
    return <TypePicker onSelect={handleTypeSelect} />;
  }

  const SelectedIcon = selectedType?.Icon;

  return (
    <div className="space-y-6">
      {/* Back + tipo seleccionado */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {SelectedIcon && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5">
            <SelectedIcon className="h-4 w-4 text-[var(--color-champagne)]" />
            <span className="text-sm font-semibold">{selectedType.label}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Título */}
        <div>
          <label className={labelCls}>
            {config.titleLabel} <span className="text-red-400 normal-case font-normal tracking-normal text-[10px]">*requerido</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={config.titlePlaceholder}
            required
            maxLength={150}
            className={inputCls}
          />
        </div>

        {/* Fecha + Lugar */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Fecha del evento</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{config.locationLabel}</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Salón Jardín, Ciudad de México"
              maxLength={200}
              className={inputCls}
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className={labelCls}>{config.bioLabel}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder={config.bioPlaceholder}
            maxLength={500}
            className={`${inputCls} resize-none`}
          />
          <p className="text-[11px] text-muted-foreground/40 text-right mt-1">
            {bio.length}/500
          </p>
        </div>

        {/* Dato curioso — solo aplica para ciertos tipos */}
        {hasFunFact && (
          <div>
            <label className={labelCls}>{config.funFactLabel}</label>
            <input
              type="text"
              value={funFact}
              onChange={(e) => setFunFact(e.target.value)}
              placeholder={config.funFactPlaceholder}
              maxLength={300}
              className={inputCls}
            />
          </div>
        )}

        {error && (
          <p className="text-sm font-medium text-red-500">{error}</p>
        )}

        {/* Qué incluye */}
        <div className="rounded-xl border border-border bg-muted/50 px-4 py-4 text-sm">
          <p className="font-semibold">Qué incluye la invitación gratis</p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              Invitación digital con tu información básica
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              RSVP digital para tus invitados (hasta 30)
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              Link personalizado por invitado
            </li>
            <li className="flex items-center gap-2 opacity-50">
              <X className="h-3.5 w-3.5 shrink-0" />
              Sin galería de fotos, música, ni cuenta regresiva
            </li>
            <li className="flex items-center gap-2 opacity-50">
              <X className="h-3.5 w-3.5 shrink-0" />
              El admin revisa y activa (puede tardar 24–48 h)
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="w-full shimmer inline-flex items-center justify-center gap-2 rounded-xl border-none px-6 py-3.5 text-sm font-bold text-[var(--color-midnight)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
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
