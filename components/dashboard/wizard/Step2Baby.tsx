"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Baby, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass = "h-14 w-full rounded-2xl border border-border bg-card/50 px-6 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none placeholder:text-muted-foreground/50";
const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1";

export function Step2Baby() {
  const { register, watch, setValue } = useFormContext<EventFormData>();
  const isSurprise = watch("babyNameSurprise");

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-sky-300 to-pink-300 p-3 shadow-lg shadow-sky-300/20">
          <Baby className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">El Bebé</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Información del baby shower</p>
        </div>
      </div>

      {/* Parents */}
      <div className="rounded-[2.5rem] bg-[var(--color-midnight)] p-8 md:p-10 space-y-8 text-white shadow-2xl shadow-[var(--color-midnight)]/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-[var(--color-brand)]" />
            <h3 className="text-lg font-black uppercase tracking-widest text-[var(--color-brand)]">Papás</h3>
          </div>
          <p className="text-xs font-medium text-white/40">Los futuros padres</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Nombre de mamá *</label>
            <input
              {...register("parentNames.mom")}
              placeholder="Ej: Ana"
              className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-medium text-white focus:bg-white/10 transition-all outline-none"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Nombre de papá (opcional)</label>
            <input
              {...register("parentNames.dad")}
              placeholder="Ej: Carlos"
              className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-medium text-white focus:bg-white/10 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Baby Name */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-3">
            <label className={labelClass}>Nombre del bebé</label>
            <input
              {...register("babyName")}
              placeholder={isSurprise ? "¡Es sorpresa! 🎉" : "Ej: Emiliano"}
              disabled={!!isSurprise}
              className={cn(inputClass, isSurprise && "opacity-50 cursor-not-allowed")}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("babyNameSurprise")}
            className="h-5 w-5 rounded-md border-border text-[var(--color-brand)] focus:ring-[var(--color-brand)]/20"
          />
          <span className="text-sm font-medium text-muted-foreground">
            🤫 El nombre es sorpresa
          </span>
        </label>
      </div>

      {/* Due Date */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <label className={labelClass}>Fecha esperada de nacimiento</label>
          <input
            type="date"
            {...register("dueDate")}
            className={inputClass}
          />
        </div>

        <div className="space-y-3">
          <label className={labelClass}>Temática del baby shower</label>
          <input
            {...register("babyShowerTheme")}
            placeholder="Ej: Safari, Lluvia de amor, Ositos..."
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
