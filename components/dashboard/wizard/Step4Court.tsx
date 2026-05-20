"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Crown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass = "h-14 w-full rounded-2xl border border-border bg-card/50 px-6 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none placeholder:text-muted-foreground/50";
const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1";

const ROLES = [
  { value: "chambelan", label: "Chambelán" },
  { value: "chambelana", label: "Chambelana" },
  { value: "padrino", label: "Padrino" },
  { value: "madrina", label: "Madrina" },
];

export function Step4Court() {
  const { register, control } = useFormContext<EventFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "court" as any,
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 p-3 shadow-lg shadow-pink-400/20">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Corte de Honor</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Chambelanes, chambelanas, padrinos y madrinas</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => append({ name: "", role: "chambelan" } as any)}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand)]/10 px-4 py-2.5 text-xs font-bold text-[var(--color-brand)] transition-all hover:bg-[var(--color-brand)]/20"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar
        </button>
      </div>

      {/* Court Members */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card/50 p-4 transition-all hover:bg-card hover:shadow-lg"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400/20 to-purple-500/20 text-sm font-black text-pink-500">
              {index + 1}
            </div>

            <input
              {...register(`court.${index}.name` as any)}
              placeholder="Nombre completo"
              className={cn(inputClass, "flex-1 h-12")}
            />

            <select
              {...register(`court.${index}.role` as any)}
              className="h-12 rounded-2xl border border-border bg-card/50 px-4 text-sm font-medium text-foreground focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none min-w-[140px]"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded-xl border border-destructive/30 p-2.5 text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Crown className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-bold text-muted-foreground">Aún no has agregado miembros</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Haz clic en "Agregar" para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
