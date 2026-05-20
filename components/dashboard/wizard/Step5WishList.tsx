"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Gift, Plus, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass = "h-12 w-full rounded-2xl border border-border bg-card/50 px-5 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none placeholder:text-muted-foreground/50";

const PRIORITIES = [
  { value: "alta", label: "Alta", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "media", label: "Media", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "baja", label: "Baja", color: "bg-green-100 text-green-700 border-green-200" },
];

export function Step5WishList() {
  const { register, control } = useFormContext<EventFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "wishList" as any,
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-champagne)] p-3 shadow-lg shadow-[var(--color-brand)]/20">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Lista de Deseos</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Artículos que a los invitados les encantará regalar</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => append({ name: "", url: "", priority: "media" } as any)}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand)]/10 px-4 py-2.5 text-xs font-bold text-[var(--color-brand)] transition-all hover:bg-[var(--color-brand)]/20"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar artículo
        </button>
      </div>

      {/* Wish List Items */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-2xl border border-border bg-card/50 p-5 transition-all hover:bg-card hover:shadow-lg space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-xs font-black text-[var(--color-brand)]">
                {index + 1}
              </div>

              <div className="flex-1 space-y-3">
                <input
                  {...register(`wishList.${index}.name` as any)}
                  placeholder="Nombre del artículo (ej: Pañalera Skip Hop)"
                  className={inputClass}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <ExternalLink className="absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
                    <input
                      {...register(`wishList.${index}.url` as any)}
                      placeholder="URL del producto (opcional)"
                      className={cn(inputClass, "pl-12")}
                    />
                  </div>

                  <select
                    {...register(`wishList.${index}.priority` as any)}
                    className="h-12 rounded-2xl border border-border bg-card/50 px-4 text-sm font-medium text-foreground focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        Prioridad: {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-xl border border-destructive/30 p-2 text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Gift className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-bold text-muted-foreground">Sin artículos todavía</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Agrega artículos para que los invitados tengan ideas de regalo</p>
          </div>
        )}
      </div>
    </div>
  );
}
