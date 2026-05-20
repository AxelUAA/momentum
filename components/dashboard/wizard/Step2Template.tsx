"use client";
import { useFormContext } from "react-hook-form";
import { EventFormData } from "@/types/event-form";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Sparkles, Crown } from "lucide-react";

interface Step2TemplateProps {
  templates?: any[];
}

export function Step2Template({ templates = [] }: Step2TemplateProps) {
  const { watch, setValue, formState: { errors } } = useFormContext<EventFormData>();
  const selectedType = watch("type");
  const selectedTemplate = watch("templateId");

  const exactMatch = templates.filter(t => t.type === selectedType);
  const filteredTemplates = exactMatch.length > 0 ? exactMatch : templates;
  const isGenericFallback = exactMatch.length === 0 && templates.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-foreground">Elige tu Diseño</h2>
        <p className="text-sm text-muted-foreground">
          {isGenericFallback
            ? "No hay un diseño específico para este tipo de evento, pero puedes usar cualquiera de los disponibles."
            : "Selecciona el estilo base para tu invitación."}
        </p>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No hay diseños disponibles aún.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplate === template.id;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setValue("templateId", template.id)}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-[2rem] border transition-all duration-500 text-left",
                  isSelected
                    ? "border-[var(--color-brand)] bg-card shadow-[0_20px_40px_rgba(0,0,0,0.1)] ring-1 ring-[var(--color-brand)]/20 scale-[1.02]"
                    : "border-border bg-card/40 hover:border-[var(--color-brand)]/30 hover:bg-card hover:shadow-2xl hover:shadow-black/5"
                )}
              >
                {template.isPremium && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold text-white shadow-lg border border-white/10">
                    <Crown className="h-3 w-3 text-yellow-400" />
                    PREMIUM
                  </div>
                )}
                
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/30">
                  {template.previewImageUrl ? (
                    <Image
                      src={template.previewImageUrl}
                      alt={template.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/40">
                      <Sparkles className="h-8 w-8" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Sin preview</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                </div>

                <div className="absolute bottom-0 w-full p-6">
                  <h3 className={cn(
                    "text-xl font-black transition-colors duration-300",
                    isSelected ? "text-[var(--color-brand)]" : "text-white"
                  )}>
                    {template.name}
                  </h3>
                </div>

                {isSelected && (
                  <div className="absolute top-4 left-4 h-6 w-6 rounded-full bg-[var(--color-brand)] border-2 border-background shadow-lg flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {errors.templateId && (
        <p className="text-sm font-bold text-red-500 mt-4 text-center">
          {errors.templateId.message}
        </p>
      )}
    </div>
  );
}
