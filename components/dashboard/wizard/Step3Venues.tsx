"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { MapPin, Clock, ExternalLink } from "lucide-react";

export function Step3Venues() {
  const { register, watch } = useFormContext<EventFormData>();
  const eventType = watch("eventType");

  const hasCeremony = !["BIRTHDAY", "CORPORATE", "BABY_SHOWER", "CASUAL", "OTHER"].includes(eventType);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Ceremonia (Condicional) */}
        {hasCeremony && (
          <div className="space-y-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <div className="rounded-full bg-[var(--color-brand)]/10 p-2">
                <MapPin className="h-5 w-5 text-[var(--color-brand)]" />
              </div>
              <h3 className="font-bold">Ceremonia</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del lugar</label>
                <input
                  {...register("ceremony.venueName")}
                  placeholder="Ej: Parroquia de San Miguel"
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dirección</label>
                <input
                  {...register("ceremony.address")}
                  placeholder="Calle, Número, Colonia, Ciudad"
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="time"
                      {...register("ceremony.time")}
                      className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Google Maps URL</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      {...register("ceremony.mapsUrl")}
                      placeholder="https://maps.app.goo.gl/..."
                      className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recepción */}
        <div className="space-y-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <div className="rounded-full bg-[var(--color-brand)]/10 p-2">
              <MapPin className="h-5 w-5 text-[var(--color-brand)]" />
            </div>
            <h3 className="font-bold">Recepción</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del lugar</label>
              <input
                {...register("reception.venueName")}
                placeholder="Ej: Hacienda San Juan"
                className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dirección</label>
              <input
                {...register("reception.address")}
                placeholder="Calle, Número, Colonia, Ciudad"
                className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="time"
                    {...register("reception.time")}
                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Google Maps URL</label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    {...register("reception.mapsUrl")}
                    placeholder="https://maps.app.goo.gl/..."
                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
