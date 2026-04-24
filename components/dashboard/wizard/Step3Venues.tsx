"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { MapPin, Clock, ExternalLink } from "lucide-react";

export function Step3Venues() {
  const { register, watch, formState: { errors } } = useFormContext<EventFormData>();
  const type = watch("type");
  const hasCeremony = !["BIRTHDAY", "CORPORATE", "BABY_SHOWER", "CASUAL", "OTHER"].includes(type);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Ceremonia (Condicional) */}
        {hasCeremony && (
          <div className="group space-y-8 rounded-[2.5rem] border border-black/5 bg-white/50 p-8 md:p-10 transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-black/5">
            <div className="flex items-center gap-4 border-b border-black/5 pb-6">
              <div className="rounded-2xl bg-[var(--color-brand)] text-white p-3 shadow-lg shadow-[var(--color-brand)]/20">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-[var(--color-midnight)] tracking-tight">Ceremonia</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-midnight)]/30">Ubicación del acto</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Nombre del lugar</label>
                <input
                  {...register("ceremony.venueName")}
                  placeholder="Ej: Parroquia de San Miguel"
                  className="h-14 w-full rounded-2xl border border-black/5 bg-white px-6 text-sm font-medium focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Dirección</label>
                <input
                  {...register("ceremony.address")}
                  placeholder="Calle, Número, Colonia, Ciudad"
                  className="h-14 w-full rounded-2xl border border-black/5 bg-white px-6 text-sm font-medium focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Hora</label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand)]" />
                    <input
                      type="time"
                      {...register("ceremony.time")}
                      className="h-14 w-full rounded-2xl border border-black/5 bg-white pl-14 pr-6 text-sm font-medium focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Google Maps</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand)]" />
                    <input
                      {...register("ceremony.mapsUrl")}
                      placeholder="Pegar enlace aquí"
                      className="h-14 w-full rounded-2xl border border-black/5 bg-white pl-14 pr-6 text-sm font-medium focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none"
                    />
                  </div>
                  {errors.ceremony?.mapsUrl && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.ceremony.mapsUrl.message}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recepción */}
        <div className="group space-y-8 rounded-[2.5rem] border border-black/5 bg-white/50 p-8 md:p-10 transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-black/5">
          <div className="flex items-center gap-4 border-b border-black/5 pb-6">
            <div className="rounded-2xl bg-[var(--color-midnight)] text-white p-3 shadow-lg shadow-[var(--color-midnight)]/20">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[var(--color-midnight)] tracking-tight">Recepción</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-midnight)]/30">Ubicación del festejo</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Nombre del lugar</label>
              <input
                {...register("reception.venueName")}
                placeholder="Ej: Hacienda San Juan"
                className="h-14 w-full rounded-2xl border border-black/5 bg-white px-6 text-sm font-medium focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Dirección</label>
              <input
                {...register("reception.address")}
                placeholder="Calle, Número, Colonia, Ciudad"
                className="h-14 w-full rounded-2xl border border-black/5 bg-white px-6 text-sm font-medium focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Hora</label>
                <div className="relative">
                  <Clock className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand)]" />
                  <input
                    type="time"
                    {...register("reception.time")}
                    className="h-14 w-full rounded-2xl border border-black/5 bg-white pl-14 pr-6 text-sm font-medium focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Google Maps</label>
                <div className="relative">
                  <ExternalLink className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand)]" />
                  <input
                    {...register("reception.mapsUrl")}
                    placeholder="Pegar enlace aquí"
                    className="h-14 w-full rounded-2xl border border-black/5 bg-white pl-14 pr-6 text-sm font-medium focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none"
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
