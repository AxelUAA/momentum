"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Shirt, Image as ImageIcon, Plus } from "lucide-react";

export function Step4DressCode() {
  const { register } = useFormContext<EventFormData>();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="space-y-8">
        <div className="flex items-center gap-4 border-b border-black/5 pb-6">
          <div className="rounded-2xl bg-[var(--color-brand)] text-white p-3 shadow-lg shadow-[var(--color-brand)]/20">
            <Shirt className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[var(--color-midnight)] tracking-tight">Código de Vestimenta</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-midnight)]/30">Instrucciones de estilo</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Estilo</label>
            <input
              {...register("dressCode.title")}
              placeholder="Ej: Elegante Playero, Formal, Black Tie"
              className="h-14 w-full rounded-2xl border border-black/5 bg-white/50 px-6 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-[var(--color-brand)]/10 transition-all outline-none"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Descripción / Notas</label>
            <input
              {...register("dressCode.description")}
              placeholder="Ej: Recomendamos evitar tacones finos."
              className="h-14 w-full rounded-2xl border border-black/5 bg-white/50 px-6 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-[var(--color-brand)]/10 transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--color-midnight)]/60 uppercase tracking-wider ml-1">Moodboard de inspiración</label>
            <p className="text-[10px] font-medium text-[var(--color-midnight)]/30 ml-1">
              URLs de imágenes (Pinterest, Unsplash, etc.)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-[2rem] border border-black/5 bg-white/50 transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-black/5">
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                  <div className="rounded-2xl bg-black/5 p-3 text-[var(--color-midnight)]/20 group-hover:bg-[var(--color-brand)]/10 group-hover:text-[var(--color-brand)] transition-colors duration-500">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <input
                    {...register(`dressCode.inspirationImages.${i}` as const)}
                    placeholder="URL de imagen"
                    className="w-full bg-transparent text-[10px] font-bold text-center focus:outline-none placeholder:text-[var(--color-midnight)]/20"
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
