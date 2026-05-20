"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { PartyPopper, Plus, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass = "h-14 w-full rounded-2xl border border-border bg-card/50 px-6 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none placeholder:text-muted-foreground/50";
const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1";

export function Step2Birthday() {
  const { register, control, formState: { errors } } = useFormContext<EventFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "funFacts" as any,
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-champagne)] p-3 shadow-lg shadow-[var(--color-brand)]/20">
          <PartyPopper className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">El Festejado</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Información del cumpleañero(a)</p>
        </div>
      </div>

      {/* Main fields */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <label className={labelClass}>Nombre del festejado(a)</label>
          <input
            {...register("celebrantName")}
            placeholder="Ej: María Fernanda"
            className={inputClass}
          />
        </div>

        <div className="space-y-3">
          <label className={labelClass}>Edad que cumple</label>
          <input
            type="number"
            {...register("celebrantAge", { valueAsNumber: true })}
            placeholder="Ej: 30"
            className={inputClass}
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-3">
        <label className={labelClass}>Biografía / Párrafo sobre el festejado</label>
        <textarea
          {...register("bio")}
          rows={4}
          placeholder="Cuenta un poco sobre quién es, qué le gusta, por qué esta fiesta es especial..."
          className="w-full rounded-2xl border border-border bg-card/50 px-6 py-4 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none resize-none placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Fun Facts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--color-brand)]" />
            <label className={labelClass}>Datos curiosos (máx 5)</label>
          </div>
          {fields.length < 5 && (
            <button
              type="button"
              onClick={() => append("" as any)}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-brand)]/10 px-4 py-2 text-xs font-bold text-[var(--color-brand)] transition-all hover:bg-[var(--color-brand)]/20"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar
            </button>
          )}
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <input
                {...register(`funFacts.${index}` as any)}
                placeholder={`Dato curioso #${index + 1}`}
                className={cn(inputClass, "flex-1")}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-xl border border-destructive/30 p-3 text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-6">
              Agrega datos curiosos como "Le encanta el café" o "Colecciona vinilos"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
