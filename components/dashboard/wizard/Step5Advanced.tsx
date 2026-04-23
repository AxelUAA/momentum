"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Palette, Gift, ToggleRight, Trash2, Plus } from "lucide-react";
import { useEffect } from "react";
import { SECTIONS_BY_EVENT_TYPE } from "@/lib/event-sections-map";
import { cn } from "@/lib/utils";

export function Step5Advanced() {
  const { register, watch, setValue, control } = useFormContext<EventFormData>();
  const eventType = watch("eventType");
  const activeSections = watch("activeSections") || {};

  const { fields, append, remove } = useFieldArray({
    control,
    name: "giftRegistry"
  });

  // Default sections based on event type if none are set
  useEffect(() => {
    if (Object.keys(activeSections).length === 0 && eventType) {
      const defaults = SECTIONS_BY_EVENT_TYPE[eventType as keyof typeof SECTIONS_BY_EVENT_TYPE];
      if (defaults) {
        setValue("activeSections", defaults as any);
      }
    }
  }, [eventType, setValue, activeSections]);

  const toggleSection = (key: string) => {
    setValue(`activeSections.${key}`, !activeSections[key]);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Colors */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-[var(--color-brand)]" />
          <h3 className="text-lg font-semibold">Paleta de Colores</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Primario</label>
            <div className="flex gap-2">
              <input type="color" {...register("colors.primary")} className="h-11 w-11 rounded-lg border-none bg-transparent cursor-pointer" />
              <input {...register("colors.primary")} className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm font-mono" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Secundario</label>
            <div className="flex gap-2">
              <input type="color" {...register("colors.secondary")} className="h-11 w-11 rounded-lg border-none bg-transparent cursor-pointer" />
              <input {...register("colors.secondary")} className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm font-mono" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Acento</label>
            <div className="flex gap-2">
              <input type="color" {...register("colors.accent")} className="h-11 w-11 rounded-lg border-none bg-transparent cursor-pointer" />
              <input {...register("colors.accent")} className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm font-mono" />
            </div>
          </div>
        </div>
      </div>

      {/* Gift Registry */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-[var(--color-brand)]" />
            <h3 className="text-lg font-semibold">Mesa de Regalos</h3>
          </div>
          <button
            type="button"
            onClick={() => append({ store: "", url: "" })}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand)]/10 px-4 py-2 text-xs font-bold text-[var(--color-brand)]"
          >
            <Plus className="h-4 w-4" />
            Añadir Tienda
          </button>
        </div>
        
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <input
                {...register(`giftRegistry.${index}.store` as const)}
                placeholder="Tienda (Ej: Liverpool, Amazon)"
                className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm"
              />
              <input
                {...register(`giftRegistry.${index}.url` as const)}
                placeholder="URL de la mesa"
                className="h-11 flex-[2] rounded-xl border border-border bg-background px-4 text-sm"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-xl border border-border p-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sections Toggle */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ToggleRight className="h-5 w-5 text-[var(--color-brand)]" />
          <h3 className="text-lg font-semibold">Secciones Activas</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Selecciona qué partes de la invitación estarán visibles para los invitados.
        </p>
        
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Object.keys(activeSections).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSection(key)}
              className={cn(
                "flex items-center justify-between rounded-xl border-2 p-3 text-xs font-bold transition-all",
                activeSections[key] 
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5 text-[var(--color-brand)]" 
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div className={cn(
                "h-2 w-2 rounded-full",
                activeSections[key] ? "bg-[var(--color-brand)] shadow-[0_0_8px_var(--color-brand)]" : "bg-muted-foreground/30"
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* RSVP Deadline */}
      <div className="space-y-4 rounded-2xl bg-muted/30 p-6">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Fecha Límite Confirmación</h3>
        </div>
        <input
          type="date"
          {...register("rsvpDeadline")}
          className="h-11 w-full max-w-xs rounded-xl border border-border bg-background px-4 text-sm"
        />
      </div>
    </div>
  );
}
