"use client";
import { useFormContext, Controller } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Shirt, Lock } from "lucide-react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { getTierFeatures } from "@/lib/event-sections-map";

export function Step4DressCode() {
  const { register, control, watch } = useFormContext<EventFormData>();
  const tier = watch("tier");
  const features = getTierFeatures(tier);

  if (!features.dressCode) {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-dashed border-border bg-muted/20 p-16 text-center">
          <div className="rounded-2xl bg-muted p-4">
            <Lock className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-foreground">No incluido en tu Plan</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              El código de vestimenta está disponible únicamente en el{" "}
              <span className="font-bold text-foreground">Plan Completo ($1,199) y Premium ($999)</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="space-y-8">
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <div className="rounded-2xl bg-[var(--color-brand)] text-white p-3 shadow-lg shadow-[var(--color-brand)]/20">
            <Shirt className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-foreground tracking-tight">Código de Vestimenta</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Instrucciones de estilo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Estilo</label>
            <input
              {...register("dressCode.title")}
              placeholder="Ej: Elegante Playero, Formal, Black Tie"
              className="h-14 w-full rounded-2xl border border-border bg-card/50 px-6 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 transition-all outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Descripción / Notas</label>
            <input
              {...register("dressCode.description")}
              placeholder="Ej: Recomendamos evitar tacones finos."
              className="h-14 w-full rounded-2xl border border-border bg-card/50 px-6 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[var(--color-brand)]/10 transition-all outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Moodboard de inspiración</label>
            <p className="text-[10px] font-medium text-muted-foreground/60 ml-1">
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
            <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Guarda el evento para habilitar la subida de imágenes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
