"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { CheckCircle2, Calendar, MapPin, User, Mail, Sparkles } from "lucide-react";
import { TIER_INFO } from "@/lib/event-sections-map";
import { sectionLabel } from "@/lib/section-labels";

export function Step6Review() {
  const { watch } = useFormContext<EventFormData>();
  const values = watch();

  const tier = TIER_INFO[values.tier as keyof typeof TIER_INFO];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">¡Todo listo para crear!</h2>
        <p className="text-muted-foreground text-sm">Revisa los datos antes de confirmar.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Resumen Principal */}
        <div className="space-y-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Resumen del Evento
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="font-bold text-lg leading-tight">{values.title}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold">Tipo</span>
                <p className="font-medium">{values.type}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold">Paquete</span>
                <p className="font-medium">{tier?.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{values.eventDate || "Pendiente"} {values.eventTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{values.reception?.venueName || "Pendiente"}</span>
            </div>
          </div>
        </div>

        {/* Resumen Cliente */}
        <div className="space-y-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> Datos del Cliente
          </h3>
          
          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold">Nombre</span>
              <p className="font-medium">{values.clientName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold">Email</span>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <p className="font-medium">{values.clientEmail}</p>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold">Slug público</span>
              <p className="font-mono text-[var(--color-brand)]">/e/{values.slug}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones */}
      <div className="rounded-2xl border border-border bg-background p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold uppercase text-muted-foreground">Secciones Activas</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(values.activeSections || {}).map(([key, active]) => (
            active && (
              <span key={key} className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-[10px] font-bold text-[var(--color-brand)] capitalize">
                {sectionLabel(key)}
              </span>
            )
          ))}
        </div>
      </div>

    </div>
  );
}
