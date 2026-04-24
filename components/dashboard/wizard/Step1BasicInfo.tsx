"use client";
import { useFormContext, Controller } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { 
  Heart, Users, PartyPopper, Briefcase, Baby, GraduationCap, 
  CalendarDays, Music, Sparkles, Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TIER_INFO } from "@/lib/event-sections-map";
import { ImageUploader } from "@/components/shared/ImageUploader";

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
  const { register, watch, setValue, control, formState: { errors } } = useFormContext<EventFormData>();
  const selectedType = watch("type");
  const selectedTier = watch("tier");

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Event Type Selection */}
      <div className="space-y-6">
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-midnight)]/30">
          Tipo de Evento
        </label>
        <div className="grid grid-cols-2 xs:grid-cols-3 gap-4 md:grid-cols-5">
          {EVENT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setValue("type", type.id as any)}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-3 rounded-[2rem] border transition-all duration-500 p-4 sm:p-6",
                  isSelected 
                    ? "border-[var(--color-brand)] bg-white text-[var(--color-midnight)] shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-[var(--color-brand)]/20" 
                    : "border-black/5 bg-white/50 text-[var(--color-midnight)]/40 hover:border-[var(--color-brand)]/30 hover:bg-white hover:text-[var(--color-midnight)] hover:shadow-xl hover:shadow-black/5"
                )}
              >
                <div className={cn(
                  "rounded-2xl p-3 transition-all duration-500",
                  isSelected ? "bg-[var(--color-brand)] text-white scale-110 shadow-lg shadow-[var(--color-brand)]/20" : "bg-black/5 text-current group-hover:bg-[var(--color-brand)]/10 group-hover:text-[var(--color-brand)]"
                )}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold tracking-tight text-center">{type.label}</span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--color-brand)] border-2 border-white shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tier Selection */}
      <div className="space-y-6">
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-midnight)]/30">
          Paquete Seleccionado
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(TIER_INFO).map(([id, info]) => {
            const isSelected = selectedTier === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setValue("tier", id as any)}
                className={cn(
                  "group relative flex flex-col gap-4 rounded-[2rem] border transition-all duration-500 p-6 text-left",
                  isSelected 
                    ? "border-[var(--color-brand)] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] ring-1 ring-[var(--color-brand)]/20" 
                    : "border-black/5 bg-white/50 hover:border-[var(--color-brand)]/30 hover:bg-white hover:shadow-2xl hover:shadow-black/5"
                )}
              >
                <div className="space-y-1">
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                    isSelected ? "text-[var(--color-brand)]" : "text-[var(--color-midnight)]/30 group-hover:text-[var(--color-midnight)]/60"
                  )}>
                    {info.label}
                  </div>
                  <div className="text-2xl font-black text-[var(--color-midnight)] tracking-tighter">
                    ${info.price}
                  </div>
                </div>
                
                <div className="h-px w-full bg-black/5" />
                
                <div className="text-[10px] font-bold text-[var(--color-midnight)]/40 flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  {info.maxGuests ? `Hasta ${info.maxGuests} invitados` : "Invitados ilimitados"}
                </div>

                {isSelected && (
                  <div className="absolute top-6 right-6 h-6 w-6 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center shadow-lg shadow-[var(--color-brand)]/20">
                    <Heart className="h-3 w-3 fill-current" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic Inputs */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 pt-4">
        <div className="space-y-3">
          <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Título del Evento</label>
          <input
            {...register("title")}
            placeholder="Ej: Boda de Lucía y Marcos"
            className="h-14 w-full rounded-2xl border border-black/5 bg-white/50 px-6 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none"
          />
          {errors.title && <p className="text-xs font-bold text-red-500 ml-1">{errors.title.message}</p>}
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Slug (URL)</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-black text-[var(--color-midnight)]/20">/e/</span>
            <input
              {...register("slug")}
              placeholder="lucia-y-marcos"
              className="h-14 w-full rounded-2xl border border-black/5 bg-white/50 pl-12 pr-6 text-sm font-mono font-medium focus:bg-white focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none"
            />
          </div>
          {errors.slug && <p className="text-xs font-bold text-red-500 ml-1">{errors.slug.message}</p>}
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Fecha del Evento</label>
          <input
            type="date"
            {...register("eventDate")}
            className="h-14 w-full rounded-2xl border border-black/5 bg-white/50 px-6 text-sm font-medium focus:bg-white transition-all outline-none"
          />
          {errors.eventDate && <p className="text-xs font-bold text-red-500 ml-1">{errors.eventDate.message}</p>}
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Hora de inicio</label>
          <input
            type="time"
            {...register("eventTime")}
            className="h-14 w-full rounded-2xl border border-black/5 bg-white/50 px-6 text-sm font-medium focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 ml-1">
          <ImageIcon className="h-4 w-4 text-[var(--color-brand)]" />
          <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider">Imagen de Portada</label>
        </div>
        
        {watch("id") ? (
          <Controller
            control={control}
            name="coverImage"
            render={({ field }) => (
              <ImageUploader
                eventId={watch("id")!}
                category="cover"
                existing={field.value}
                onUpload={field.onChange}
                maxFiles={1}
              />
            )}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-black/10 bg-black/5 p-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-midnight)]/30">
              Guarda el evento para habilitar la subida de portada
            </p>
          </div>
        )}
      </div>

      {/* Client Info */}
      <div className="rounded-[2.5rem] bg-[var(--color-midnight)] p-8 md:p-12 space-y-8 text-white shadow-2xl shadow-[var(--color-midnight)]/20">
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase tracking-widest text-[var(--color-brand)]">Datos del Cliente</h3>
          <p className="text-xs font-medium text-white/40">Información de contacto para facturación y coordinación.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Nombre Completo</label>
            <input
              {...register("clientName")}
              className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-medium focus:bg-white/10 transition-all outline-none"
            />
            {errors.clientName && <p className="text-xs font-bold text-[var(--color-brand)] ml-1">{errors.clientName.message}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Email de contacto</label>
            <input
              {...register("clientEmail")}
              className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-medium focus:bg-white/10 transition-all outline-none"
            />
            {errors.clientEmail && <p className="text-xs font-bold text-[var(--color-brand)] ml-1">{errors.clientEmail.message}</p>}
          </div>
        </div>
      </div>
    </div>

  );
}
