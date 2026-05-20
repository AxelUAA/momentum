"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { MapPin, Clock, ExternalLink } from "lucide-react";

export function Step3Venues() {
  const { register, watch, formState: { errors } } = useFormContext<EventFormData>();
  const type = watch("type");
  const hasCeremony = !["BIRTHDAY", "CORPORATE", "BABY_SHOWER", "CASUAL", "OTHER"].includes(type);

  const inputClass = "h-14 w-full rounded-2xl border border-border bg-card/50 px-6 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none placeholder:text-muted-foreground/50";
  const inputWithIconClass = "h-14 w-full rounded-2xl border border-border bg-card/50 pl-14 pr-6 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none placeholder:text-muted-foreground/50";
  const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1";
  const cardClass = "group space-y-8 rounded-[2.5rem] border border-border bg-card/50 p-8 md:p-10 transition-all duration-500 hover:bg-card hover:shadow-2xl hover:shadow-black/5";

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Ceremonia (Condicional) */}
        {hasCeremony && (
          <div className={cardClass}>
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="rounded-2xl bg-[var(--color-brand)] text-white p-3 shadow-lg shadow-[var(--color-brand)]/20">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-foreground tracking-tight">Ceremonia</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Ubicación del acto</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className={labelClass}>Nombre del lugar</label>
                <input
                  {...register("ceremony.venueName")}
                  placeholder="Ej: Parroquia de San Miguel"
                  className={inputClass}
                />
              </div>
              <div className="space-y-3">
                <label className={labelClass}>Dirección</label>
                <input
                  {...register("ceremony.address")}
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
                      {...register("ceremony.time")}
                      className={inputWithIconClass}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className={labelClass}>Google Maps</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand)]" />
                    <input
                      {...register("ceremony.mapsUrl")}
                      placeholder="Pegar enlace aquí"
                      className={inputWithIconClass}
                    />
                  </div>
                  {errors.ceremony?.mapsUrl && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.ceremony.mapsUrl.message}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recepción */}
        <div className={cardClass}>
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="rounded-2xl bg-[var(--color-midnight)] text-white p-3 shadow-lg shadow-[var(--color-midnight)]/20">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-foreground tracking-tight">Recepción</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Ubicación del festejo</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className={labelClass}>Nombre del lugar</label>
              <input
                {...register("reception.venueName")}
                placeholder="Ej: Hacienda San Juan"
                className={inputClass}
              />
            </div>
            <div className="space-y-3">
              <label className={labelClass}>Dirección</label>
              <input
                {...register("reception.address")}
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
                    {...register("reception.time")}
                    className={inputWithIconClass}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className={labelClass}>Google Maps</label>
                <div className="relative">
                  <ExternalLink className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand)]" />
                  <input
                    {...register("reception.mapsUrl")}
                    placeholder="Pegar enlace aquí"
                    className={inputWithIconClass}
                  />
                </div>
                {errors.reception?.mapsUrl && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.reception.mapsUrl.message}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
