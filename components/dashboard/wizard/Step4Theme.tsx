"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "safari",       label: "Safari",         emoji: "🦁", colors: ["#F5E6C8", "#8B6914", "#2D5016"] },
  { id: "nubes",        label: "Nubes",          emoji: "☁️", colors: ["#E8F4FD", "#87CEEB", "#B0D4F1"] },
  { id: "flores",       label: "Flores",         emoji: "🌸", colors: ["#FFE4E1", "#FFB6C1", "#FF69B4"] },
  { id: "estrellitas",  label: "Estrellitas",    emoji: "⭐", colors: ["#1B1464", "#FDB813", "#F5F5DC"] },
  { id: "dinosaurios",  label: "Dinosaurios",    emoji: "🦕", colors: ["#90EE90", "#228B22", "#8B4513"] },
  { id: "lluvia-amor",  label: "Lluvia de Amor", emoji: "💧", colors: ["#E0F7FA", "#80DEEA", "#F8BBD0"] },
  { id: "abejitas",     label: "Abejitas",       emoji: "🐝", colors: ["#FFF8E1", "#FFC107", "#212121"] },
  { id: "arcoiris",     label: "Arcoíris",       emoji: "🌈", colors: ["#FF6B6B", "#48BB78", "#4299E1"] },
];

export function Step4Theme() {
  const { watch, setValue, register } = useFormContext<EventFormData>();
  const selectedTheme = watch("babyShowerTheme");

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-yellow-300 to-pink-400 p-3 shadow-lg shadow-yellow-300/20">
          <Palette className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Temática del Baby Shower</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Elige un tema o escribe el tuyo</p>
        </div>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {THEMES.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setValue("babyShowerTheme", theme.id)}
              className={cn(
                "group relative flex flex-col items-center gap-3 rounded-[2rem] border p-6 transition-all duration-500",
                isSelected
                  ? "border-[var(--color-brand)] bg-card shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-[var(--color-brand)]/20"
                  : "border-border bg-card/40 hover:border-[var(--color-brand)]/30 hover:bg-card hover:shadow-xl"
              )}
            >
              {/* Color preview */}
              <div className="flex gap-1.5">
                {theme.colors.map((c, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border border-white/50 shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <span className="text-3xl">{theme.emoji}</span>
              <span className="text-xs font-bold tracking-tight text-center">{theme.label}</span>

              {isSelected && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand)] shadow-sm">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom theme input */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
          O escribe tu propia temática
        </label>
        <input
          {...register("babyShowerTheme")}
          placeholder="Ej: Mariposas monarca, Cochinitos, etc."
          className="h-14 w-full rounded-2xl border border-border bg-card/50 px-6 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 focus:border-[var(--color-brand)]/30 transition-all outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Color Picker for custom palette */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
          Colores personalizados (opcional)
        </label>
        <div className="flex gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase ml-1">Primario</span>
            <input
              type="color"
              {...register("colors.primary")}
              className="h-12 w-16 rounded-xl border border-border cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase ml-1">Secundario</span>
            <input
              type="color"
              {...register("colors.secondary")}
              className="h-12 w-16 rounded-xl border border-border cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase ml-1">Acento</span>
            <input
              type="color"
              {...register("colors.accent")}
              className="h-12 w-16 rounded-xl border border-border cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
