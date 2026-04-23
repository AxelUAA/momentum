"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { 
  Heart, Users, PartyPopper, Briefcase, Baby, GraduationCap, 
  CalendarDays, Music, Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TIER_INFO } from "@/lib/event-sections-map";

const EVENT_TYPES = [
  { id: "WEDDING", label: "Boda", icon: Heart },
  { id: "XV", label: "XV Años", icon: Sparkles },
  { id: "BIRTHDAY", label: "Cumpleaños", icon: PartyPopper },
  { id: "CORPORATE", label: "Corporativo", icon: Briefcase },
  { id: "BAPTISM", label: "Bautizo", icon: Baby },
  { id: "GRADUATION", label: "Graduación", icon: GraduationCap },
  { id: "BABY_SHOWER", label: "Baby Shower", icon: Baby },
  { id: "CASUAL", label: "Casual / Reunión", icon: Music },
  { id: "OTHER", label: "Otro", icon: CalendarDays },
];

export function Step1BasicInfo() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<EventFormData>();
  const selectedType = watch("eventType");
  const selectedTier = watch("tier");

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Event Type Selection */}
      <div className="space-y-4">
        <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Tipo de Evento
        </label>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
          {EVENT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setValue("eventType", type.id as any)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200",
                  isSelected 
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5 text-[var(--color-brand)] shadow-md" 
                    : "border-border bg-background hover:border-[var(--color-brand)]/30 hover:bg-muted/30"
                )}
              >
                <Icon className={cn("h-6 w-6", isSelected ? "text-[var(--color-brand)]" : "text-muted-foreground")} />
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tier Selection */}
      <div className="space-y-4">
        <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Paquete (Tier)
        </label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(TIER_INFO).map(([id, info]) => {
            const isSelected = selectedTier === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setValue("tier", id as any)}
                className={cn(
                  "flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-200",
                  isSelected 
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5 ring-1 ring-[var(--color-brand)]" 
                    : "border-border bg-background hover:border-[var(--color-brand)]/30"
                )}
              >
                <div className="text-sm font-bold">{info.label}</div>
                <div className="text-xl font-black text-[var(--color-midnight)] dark:text-[var(--color-cream)]">
                  ${info.price}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {info.maxGuests ? `Hasta ${info.maxGuests} invitados` : "Invitados ilimitados"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic Inputs */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Título del Evento</label>
          <input
            {...register("title")}
            placeholder="Ej: Boda de Lucía y Marcos"
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:ring-2 focus:ring-[var(--color-brand)]/20"
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Slug (URL)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">/e/</span>
            <input
              {...register("slug")}
              placeholder="lucia-y-marcos"
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm font-mono focus:ring-2 focus:ring-[var(--color-brand)]/20"
            />
          </div>
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha del Evento</label>
          <input
            type="date"
            {...register("eventDate")}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Hora de inicio</label>
          <input
            type="time"
            {...register("eventTime")}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
          />
        </div>
      </div>

      {/* Client Info */}
      <div className="rounded-2xl bg-muted/30 p-6 space-y-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Datos del Cliente</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre del Cliente</label>
            <input
              {...register("clientName")}
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email del Cliente</label>
            <input
              {...register("clientEmail")}
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
