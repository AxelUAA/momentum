"use client";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { eventFormSchema, type EventFormData } from "@/types/event-form";
import { createEvent } from "@/app/actions/events";
import { Step1BasicInfo } from "@/components/dashboard/wizard/Step1BasicInfo";
import { Step2Story } from "@/components/dashboard/wizard/Step2Story";
import { Step3Venues } from "@/components/dashboard/wizard/Step3Venues";
import { Step4DressCode } from "@/components/dashboard/wizard/Step4DressCode";
import { Step5Advanced } from "@/components/dashboard/wizard/Step5Advanced";
import { Step6Review } from "@/components/dashboard/wizard/Step6Review";

const STEPS = [
  { title: "Básicos", component: Step1BasicInfo },
  { title: "Historia", component: Step2Story },
  { title: "Lugares", component: Step3Venues },
  { title: "Dress Code", component: Step4DressCode },
  { title: "Avanzado", component: Step5Advanced },
  { title: "Revisión", component: Step6Review },
];

export default function NewEventWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      eventType: "WEDDING",
      tier: "ESSENTIAL",
      timeline: [],
      giftRegistry: [],
      activeSections: {},
    }
  });

  const { handleSubmit, trigger, watch, reset } = methods;

  // Auto-save logic
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

  const next = async () => {
    // Validar solo los campos del paso actual (simplificado por ahora)
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ["title", "slug", "eventType", "tier", "eventDate", "clientEmail", "clientName"];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
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
      if (result.success) {
        localStorage.removeItem("event-draft");
        router.push(`/dashboard/events/${result.eventId}`);
      } else {
        setError(result.error || "Ocurrió un error inesperado");
      }
    } catch (e) {
      setError("Error de conexión con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActiveStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-muted/20 pb-20 pt-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Progress Bar */}
        <div className="mb-12 relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-border" />
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 z-10",
                  currentStep > idx + 1 ? "bg-green-500 border-green-500 text-white" :
                  currentStep === idx + 1 ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-[var(--color-midnight)] shadow-[0_0_15px_rgba(212,175,122,0.4)]" :
                  "bg-background border-border text-muted-foreground"
                )}
              >
                {currentStep > idx + 1 ? <Check className="h-5 w-5" /> : idx + 1}
              </div>
              <span className={cn(
                "absolute top-12 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-colors",
                currentStep === idx + 1 ? "text-[var(--color-midnight)]" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="rounded-3xl border border-border bg-background p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <ActiveStepComponent />

              {error && (
                <div className="mt-8 rounded-xl bg-destructive/10 p-4 text-center text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
                <button
                  type="button"
                  onClick={prev}
                  disabled={currentStep === 1 || isSubmitting}
                  className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-bold transition-all hover:bg-muted disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>

                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={next}
                    className="flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-8 py-3 text-sm font-bold text-[var(--color-cream)] transition-all hover:scale-105 active:scale-95"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="shimmer flex items-center gap-2 rounded-xl border-none px-10 py-3 text-sm font-bold text-[var(--color-midnight)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Creando..." : "Crear Evento"}
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
