"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/app/actions/onboarding";
import { CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkedItems, setCheckedItems] = useState({
    profile: false,
    event: false,
    images: false,
    share: false,
  });

  const allChecked = Object.values(checkedItems).every(Boolean);

  const toggleItem = (key: keyof typeof checkedItems) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const res = await completeOnboarding();
      if (res.success) {
        toast.success("¡Bienvenido a Momentum!");
        router.push("/dashboard");
      } else {
        toast.error(res.error || "Hubo un problema al completar el onboarding");
        setIsSubmitting(false);
      }
    } catch (e) {
      toast.error("Error al completar el onboarding");
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      id: "profile" as const,
      title: "Completa tu perfil",
      description: "Agrega tu nombre y teléfono para que tus clientes te identifiquen.",
    },
    {
      id: "event" as const,
      title: "Crea tu primer evento",
      description: "Ve a la sección de eventos y haz clic en 'Crear nuevo evento'.",
    },
    {
      id: "images" as const,
      title: "Sube imágenes al evento",
      description: "Sube la foto de portada y algunas fotos a la galería.",
    },
    {
      id: "share" as const,
      title: "Comparte el link de preview",
      description: "Copia el enlace de tu evento y envíalo a tu cliente para revisión.",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-champagne)]/20">
          <Sparkles className="h-8 w-8 text-[var(--color-brand)]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-midnight)] dark:text-[var(--color-cream)] font-serif" style={{ fontFamily: "var(--font-fraunces), serif" }}>
          Bienvenido a Momentum
        </h1>
        <p className="mt-3 text-muted-foreground">
          Sigue esta pequeña guía interactiva para familiarizarte con la plataforma.
          Marca los pasos conforme los vayas completando.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        {steps.map((step) => {
          const isChecked = checkedItems[step.id];
          return (
            <div
              key={step.id}
              onClick={() => toggleItem(step.id)}
              className={cn(
                "flex cursor-pointer gap-4 rounded-xl border p-4 transition-all hover:bg-muted/50",
                isChecked
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5"
                  : "border-border bg-background"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {isChecked ? (
                  <CheckCircle2 className="h-6 w-6 text-[var(--color-brand)]" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/50" />
                )}
              </div>
              <div>
                <h3 className={cn("font-semibold", isChecked && "text-[var(--color-brand)]")}>
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleComplete}
          disabled={isSubmitting || !allChecked}
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-xl px-8 text-sm font-medium transition-all",
            allChecked
              ? "shimmer bg-[var(--color-brand)] text-[var(--color-midnight)] shadow-lg shadow-[var(--color-brand)]/20 hover:scale-105"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          {isSubmitting ? "Guardando..." : "Listo, ir al dashboard"}
          {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
