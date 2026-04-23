"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Shirt, Image as ImageIcon, Plus } from "lucide-react";

export function Step4DressCode() {
  const { register } = useFormContext<EventFormData>();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shirt className="h-5 w-5 text-[var(--color-brand)]" />
          <h3 className="text-lg font-semibold">Código de Vestimenta</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Estilo</label>
            <input
              {...register("dressCode.title")}
              placeholder="Ej: Elegante Playero, Formal, Black Tie"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción / Notas</label>
            <input
              {...register("dressCode.description")}
              placeholder="Ej: Recomendamos evitar tacones finos por el césped."
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium">Moodboard de inspiración (URLs de imágenes)</label>
          <p className="text-xs text-muted-foreground">
            En esta fase, añade URLs directas de imágenes (ej. de Unsplash o Pinterest). 
            La carga de archivos estará disponible en la Fase 4.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-[var(--color-brand)]/50">
                <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-[var(--color-brand)]" />
                  <input
                    {...register(`dressCode.inspirationImages.${i}` as const)}
                    placeholder="URL de imagen"
                    className="mt-2 w-full bg-transparent text-[10px] text-center focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
