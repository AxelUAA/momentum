"use client";
import { useState, useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { eventFormSchema, type EventFormData, type EventFormInput } from "@/types/event-form";
import { createEvent } from "@/app/actions/events";
import { getWizardSteps } from "@/lib/wizard-config";
import { getTierFeatures } from "@/lib/event-sections-map";

type TemplateOption = {
  id: string;
  name: string;
  slug: string;
  type: string;
  previewImageUrl: string | null;
  isPremium: boolean;
};

export default function NewEventWizard({ isAdmin, templates = [] }: { isAdmin?: boolean; templates?: TemplateOption[] }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<EventFormInput, unknown, EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      type: "WEDDING",
      tier: "ESSENTIAL",
      timeline: [],
      giftRegistry: [],
      activeSections: {},
      funFacts: [],
      court: [],
      wishList: [],
    }
  });

  const { handleSubmit, trigger, watch, reset } = methods;

  // ─── Dynamic steps based on event type and tier features ───────────────
  const eventType = watch("type");
  const tier = watch("tier") || "ESSENTIAL";
  const features = getTierFeatures(tier);
  const rawSteps = getWizardSteps(eventType);
  const steps = rawSteps.filter((step) => {
    if (step.title.includes("Dress Code") && !features.dressCode) {
      return false;
    }
    if ((step.title.includes("deseos") || step.title.includes("regalos")) && !features.giftRegistry) {
      return false;
    }
    return true;
  });
  const prevType = useRef(eventType);

  // Reset to step 1 when event type changes (except on initial render)
  useEffect(() => {
    if (prevType.current !== eventType) {
      setCurrentStep(1);
      prevType.current = eventType;
    }
  }, [eventType]);

  // Clamp current step if steps list shrinks
  useEffect(() => {
    if (currentStep > steps.length) {
      setCurrentStep(steps.length);
    }
  }, [steps.length, currentStep]);

  // ─── Auto-save logic ───────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("event-draft");
    if (saved) {
      if (confirm("Hemos encontrado un borrador previo. ¿Deseas continuar donde te quedaste?")) {
        reset(JSON.parse(saved));
      } else {
        localStorage.removeItem("event-draft");
      }
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem("event-draft", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // ─── Navigation ────────────────────────────────────────────────────────
  const next = async () => {
    // Validate step 1 fields regardless of event type
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ["type", "tier"];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      window.scrollTo(0, 0);
    }
  };

  const prev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createEvent(data);
      if (result.success && result.event) {
        localStorage.removeItem("event-draft");
        router.push(`/dashboard/events/${result.event.id}`);
      } else {
        setError(result.error || "Ocurrió un error inesperado");
      }
    } catch (e) {
      setError("Error de conexión con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActiveStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-muted/20 pb-20 pt-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Progress Bar */}
        <div className="mb-12 relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-border" />
          {steps.map((step, idx) => (
            <div key={`${eventType}-${idx}`} className="relative flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border-2 transition-all duration-300 z-10 text-xs md:text-sm font-bold",
                  currentStep > idx + 1 ? "bg-green-500 border-green-500 text-white" :
                  currentStep === idx + 1 ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-[var(--color-midnight)] shadow-[0_0_15px_rgba(212,175,122,0.4)]" :
                  "bg-background border-border text-muted-foreground"
                )}
              >
                {currentStep > idx + 1 ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : idx + 1}
              </div>
              <span className={cn(
                "absolute top-10 md:top-12 whitespace-nowrap text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-colors hidden sm:block",
                currentStep === idx + 1 ? "text-[var(--color-midnight)]" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
              {/* Mobile current step indicator */}
              {currentStep === idx + 1 && (
                <span className="absolute top-10 whitespace-nowrap text-[9px] font-bold uppercase text-[var(--color-midnight)] sm:hidden">
                  {step.title}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="rounded-3xl border border-border bg-background p-5 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="min-h-[400px]">
                <ActiveStepComponent isAdmin={isAdmin} templates={templates} />
              </div>

              {error && (
                <div className="mt-8 rounded-xl bg-destructive/10 p-4 text-center text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-12 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-8">
                <button
                  type="button"
                  onClick={prev}
                  disabled={currentStep === 1 || isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border px-8 py-4 text-sm font-bold transition-all hover:bg-muted disabled:opacity-30 w-full sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={next}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-midnight)] px-10 py-4 text-sm font-bold text-[var(--color-cream)] transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto shadow-lg shadow-black/10"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-10 py-4 text-sm font-bold text-[var(--color-midnight)] transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto shadow-lg shadow-[var(--color-brand)]/20 disabled:opacity-50"
                  >
                    {isSubmitting ? "Creando..." : "Crear evento"}
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
