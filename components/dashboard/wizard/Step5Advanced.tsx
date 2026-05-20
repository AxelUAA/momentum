"use client";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { Palette, Gift, ToggleRight, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { useEffect } from "react";
import { SECTIONS_BY_EVENT_TYPE } from "@/lib/event-sections-map";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/shared/ImageUploader";

const LIMITED_TIERS = ["EXPRESS", "ESSENTIAL"];
const LUXURY_SECTIONS = ["guestbook", "spotify", "whatsappGenerator"];

export function Step5Advanced() {
  const { register, watch, setValue, control, formState: { errors } } = useFormContext<EventFormData>();
  const type = watch("type");
  const tier = watch("tier");
  const activeSections = watch("activeSections") || {};
  const isLimited = LIMITED_TIERS.includes(tier);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "giftRegistry"
  });

  useEffect(() => {
    if (Object.keys(activeSections).length === 0 && type) {
      const defaults = SECTIONS_BY_EVENT_TYPE[type as keyof typeof SECTIONS_BY_EVENT_TYPE];
      if (defaults) {
        setValue("activeSections", defaults as any);
      }
    }
  }, [type, setValue, activeSections]);

  const toggleSection = (key: string) => {
    setValue(`activeSections.${key}`, !activeSections[key]);
  };

  const sectionHeaderClass = "flex items-center gap-4 border-b border-border pb-6";
  const sectionTitleClass = "text-xl font-black text-foreground tracking-tight";
  const sectionSubtitleClass = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60";

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Colors */}
      <div className="space-y-8">
        <div className={sectionHeaderClass}>
          <div className="rounded-2xl bg-[var(--color-brand)] text-white p-3 shadow-lg shadow-[var(--color-brand)]/20">
            <Palette className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className={sectionTitleClass}>Paleta de Colores</h3>
            <p className={sectionSubtitleClass}>Identidad visual</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {["primary", "secondary", "accent"].map((colorKey) => (
            <div key={colorKey} className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 capitalize">
                {colorKey === "primary" ? "Primario" : colorKey === "secondary" ? "Secundario" : "Acento"}
              </label>
              <div className="flex gap-2 p-2 rounded-2xl border border-border bg-card/50">
                <input
                  type="color"
                  {...register(`colors.${colorKey}` as any)}
                  className="h-10 w-10 rounded-xl border-none bg-transparent cursor-pointer shrink-0 overflow-hidden"
                />
                <input
                  {...register(`colors.${colorKey}` as any)}
                  className="h-10 flex-1 bg-transparent px-2 text-xs font-mono font-bold text-foreground outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gift Registry — solo LUXURY */}
      {!isLimited && (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[var(--color-brand)] text-white p-3 shadow-lg shadow-[var(--color-brand)]/20">
              <Gift className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className={sectionTitleClass}>Mesa de Regalos</h3>
              <p className={sectionSubtitleClass}>Opciones para invitados</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => append({ store: "", url: "" })}
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-midnight)] px-6 py-3 text-xs font-bold text-white shadow-xl shadow-[var(--color-midnight)]/10 hover:shadow-[var(--color-midnight)]/20 active:scale-95 transition-all w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Añadir Tienda
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="group flex flex-col sm:flex-row gap-4 p-6 rounded-[2rem] border border-border bg-card/50 relative transition-all duration-500 hover:bg-card hover:shadow-2xl hover:shadow-black/5">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Establecimiento</label>
                <input
                  {...register(`giftRegistry.${index}.store` as const)}
                  placeholder="Tienda (Ej: Liverpool, Amazon)"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground focus:ring-4 focus:ring-[var(--color-brand)]/10 outline-none transition-all placeholder:text-muted-foreground/50"
                />
                {errors.giftRegistry?.[index]?.store && (
                  <p className="text-[10px] font-bold text-red-500 ml-1">{errors.giftRegistry[index]?.store?.message}</p>
                )}
              </div>
              <div className="flex-[2] space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Enlace Directo</label>
                <input
                  {...register(`giftRegistry.${index}.url` as const)}
                  placeholder="URL de la mesa"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground focus:ring-4 focus:ring-[var(--color-brand)]/10 outline-none transition-all placeholder:text-muted-foreground/50"
                />
                {errors.giftRegistry?.[index]?.url && (
                  <p className="text-[10px] font-bold text-red-500 ml-1">{errors.giftRegistry[index]?.url?.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-6 right-6 sm:static sm:self-end rounded-full bg-destructive/10 p-3 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      )} {/* end !isLimited giftRegistry */}

      {/* Gallery */}
      <div className="space-y-8">
        <div className={sectionHeaderClass}>
          <div className="rounded-2xl bg-[var(--color-brand)] text-white p-3 shadow-lg shadow-[var(--color-brand)]/20">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className={sectionTitleClass}>Galería de Fotos</h3>
            <p className={sectionSubtitleClass}>Momentos especiales</p>
          </div>
        </div>

        {watch("id") ? (
          <Controller
            control={control}
            name="gallery"
            render={({ field }) => (
              <ImageUploader
                eventId={watch("id")!}
                category="gallery"
                existing={field.value}
                onUpload={field.onChange}
                maxFiles={10}
              />
            )}
          />
        ) : (
          <div className="rounded-[2rem] border border-dashed border-border bg-muted/30 p-12 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Guarda el evento para habilitar la galería de fotos
            </p>
          </div>
        )}
      </div>

      {/* Sections Toggle */}
      <div className="space-y-8">
        <div className={sectionHeaderClass}>
          <div className="rounded-2xl bg-[var(--color-brand)] text-white p-3 shadow-lg shadow-[var(--color-brand)]/20">
            <ToggleRight className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className={sectionTitleClass}>Secciones Activas</h3>
            <p className={sectionSubtitleClass}>Visibilidad de la invitación</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Object.keys(activeSections)
            .filter((key) => !(isLimited && LUXURY_SECTIONS.includes(key)))
            .map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSection(key)}
              className={cn(
                "group flex items-center justify-between rounded-2xl border transition-all duration-500 p-5",
                activeSections[key]
                  ? "border-[var(--color-brand)] bg-card text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                  : "border-border bg-card/40 text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div className={cn(
                "h-2 w-2 rounded-full transition-all duration-500",
                activeSections[key] ? "bg-[var(--color-brand)] scale-125 shadow-[0_0_12px_var(--color-brand)]" : "bg-muted-foreground/30"
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* RSVP Deadline — dark card intentional */}
      <div className="rounded-[2.5rem] bg-[var(--color-midnight)] p-8 md:p-12 text-white shadow-2xl shadow-[var(--color-midnight)]/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-widest text-[var(--color-brand)]">Fecha Límite Confirmación</h3>
            <p className="text-xs font-medium text-white/40">Último día para que los invitados confirmen.</p>
          </div>
          <input
            type="date"
            {...register("rsvpDeadline")}
            className="h-14 w-full sm:w-64 rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-medium text-white focus:bg-white/10 outline-none transition-all"
          />
        </div>
      </div>
    </div>

  );
}
