"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Sparkles } from "lucide-react";

const inputClass = "h-14 w-full rounded-2xl border border-border bg-card/50 px-6 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none placeholder:text-muted-foreground/50";
const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1";

export function Step2QuinceStory() {
  const { register } = useFormContext<EventFormData>();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 p-3 shadow-lg shadow-pink-400/20">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Su Historia</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">La quinceañera y su historia personal</p>
        </div>
      </div>

      {/* Celebrant Name */}
      <div className="space-y-3">
        <label className={labelClass}>Nombre de la quinceañera</label>
        <input
          {...register("celebrantName")}
          placeholder="Ej: Valentina Sofía"
          className={inputClass}
        />
      </div>

      {/* Story */}
      <div className="space-y-3">
        <label className={labelClass}>Su historia</label>
        <textarea
          {...register("story")}
          rows={6}
          placeholder="Escribe un párrafo sobre la quinceañera: quién es, sus sueños, por qué esta celebración es especial para ella..."
          className="w-full rounded-2xl border border-border bg-card/50 px-6 py-4 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none resize-none placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  );
}
