"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Plus, Trash2, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function Step2Story() {
  const { register, control, formState: { errors } } = useFormContext<EventFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "timeline"
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-[var(--color-brand)]" />
          <h3 className="text-lg font-semibold">Nuestra Historia</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Escribe un breve texto que dé la bienvenida a los invitados y cuente algo especial sobre el evento.
        </p>
        <textarea
          {...register("story")}
          placeholder="Había una vez..."
          rows={6}
          className="w-full rounded-2xl border border-border bg-background p-4 text-sm focus:ring-2 focus:ring-[var(--color-brand)]/20"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Línea del Tiempo</h3>
            <p className="text-sm text-muted-foreground">Momentos clave que marcaron el camino.</p>
          </div>
          <button
            type="button"
            onClick={() => append({ year: "", title: "", description: "" })}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand)]/10 px-4 py-2 text-xs font-bold text-[var(--color-brand)] hover:bg-[var(--color-brand)]/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Añadir Momento
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div 
              key={field.id} 
              className="group relative grid grid-cols-1 gap-4 rounded-2xl border border-border bg-muted/20 p-6 md:grid-cols-12"
            >
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Año</label>
                <input
                  {...register(`timeline.${index}.year` as const)}
                  placeholder="2024"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </div>
              <div className="md:col-span-4">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Título</label>
                <input
                  {...register(`timeline.${index}.title` as const)}
                  placeholder="Nos conocimos"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </div>
              <div className="md:col-span-5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Descripción</label>
                <input
                  {...register(`timeline.${index}.description` as const)}
                  placeholder="En una tarde lluviosa..."
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </div>
              <div className="flex items-end justify-center md:col-span-1">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
              No has añadido momentos a la línea del tiempo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
