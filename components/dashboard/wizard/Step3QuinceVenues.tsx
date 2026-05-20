"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { MapPin, Clock, ExternalLink, Church, Music } from "lucide-react";

const inputClass = "h-14 w-full rounded-2xl border border-border bg-card/50 px-6 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none placeholder:text-muted-foreground/50";
const inputWithIconClass = "h-14 w-full rounded-2xl border border-border bg-card/50 pl-14 pr-6 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none placeholder:text-muted-foreground/50";
const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1";
const cardClass = "group space-y-8 rounded-[2.5rem] border border-border bg-card/50 p-8 md:p-10 transition-all duration-500 hover:bg-card hover:shadow-2xl hover:shadow-black/5";

function VenueCard({
  title,
  subtitle,
  icon: Icon,
  prefix,
  iconBg,
}: {
  title: string;
  subtitle: string;
  icon: typeof MapPin;
  prefix: "misa" | "fiesta";
  iconBg: string;
}) {
  const { register, formState: { errors } } = useFormContext<EventFormData>();

  return (
    <div className={cardClass}>
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className={`rounded-2xl p-3 shadow-lg text-white ${iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-foreground tracking-tight">{title}</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className={labelClass}>Nombre del lugar</label>
          <input
            {...register(`${prefix}.venueName`)}
            placeholder={prefix === "misa" ? "Ej: Parroquia de la Asunción" : "Ej: Salón Imperial"}
            className={inputClass}
          />
        </div>
        <div className="space-y-3">
          <label className={labelClass}>Dirección</label>
          <input
            {...register(`${prefix}.address`)}
            placeholder="Calle, Número, Colonia, Ciudad"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <label className={labelClass}>Hora</label>
            <div className="relative">
              <Clock className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand)]" />
              <input
                type="time"
                {...register(`${prefix}.time`)}
                className={inputWithIconClass}
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className={labelClass}>Google Maps</label>
            <div className="relative">
              <ExternalLink className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand)]" />
              <input
                {...register(`${prefix}.mapsUrl`)}
                placeholder="Pegar enlace aquí"
                className={inputWithIconClass}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Step3QuinceVenues() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <VenueCard
          title="Misa"
          subtitle="Ceremonia religiosa"
          icon={Church}
          prefix="misa"
          iconBg="bg-[var(--color-brand)] shadow-[var(--color-brand)]/20"
        />
        <VenueCard
          title="Fiesta"
          subtitle="Recepción y baile"
          icon={Music}
          prefix="fiesta"
          iconBg="bg-[var(--color-midnight)] shadow-[var(--color-midnight)]/20"
        />
      </div>
    </div>
  );
}
