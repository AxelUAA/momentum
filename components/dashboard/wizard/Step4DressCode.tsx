"use client";
import { useFormContext, Controller } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Shirt, Image as ImageIcon, Plus } from "lucide-react";
import { ImageUploader } from "@/components/shared/ImageUploader";

export function Step4DressCode() {
  const { register, control, watch } = useFormContext<EventFormData>();

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
              Sube hasta 6 imágenes para inspirar a tus invitados.
            </p>
          </div>
          
          {watch("id") ? (
            <Controller
              control={control}
              name="dressCode.images"
              render={({ field }) => (
                <ImageUploader
                  eventId={watch("id")!}
                  category="dress-code"
                  existing={field.value}
                  onUpload={field.onChange}
                  maxFiles={6}
                />
              )}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-black/10 bg-black/5 p-12 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-midnight)]/30">
                Guarda el evento para habilitar la subida de imágenes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
