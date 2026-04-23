"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { 
  Save, ArrowLeft, Info, History, MapPin, 
  Shirt, Palette, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";

import { eventFormSchema, type EventFormData } from "@/types/event-form";
import { updateEvent } from "@/app/actions/events";
import { Step1BasicInfo } from "@/components/dashboard/wizard/Step1BasicInfo";
import { Step2Story } from "@/components/dashboard/wizard/Step2Story";
import { Step3Venues } from "@/components/dashboard/wizard/Step3Venues";
import { Step4DressCode } from "@/components/dashboard/wizard/Step4DressCode";
import { Step5Advanced } from "@/components/dashboard/wizard/Step5Advanced";

const SECTIONS = [
  { id: "basic", title: "Básicos", icon: Info, component: Step1BasicInfo },
  { id: "story", title: "Historia", icon: History, component: Step2Story },
  { id: "venues", title: "Lugares", icon: MapPin, component: Step3Venues },
  { id: "dress", title: "Dress Code", icon: Shirt, component: Step4DressCode },
  { id: "advanced", title: "Avanzado", icon: Palette, component: Step5Advanced },
];

export default function EditEventClient({ event }: { event: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parse initial data
  const methods = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event.title,
      slug: event.slug,
      eventType: event.eventType,
      tier: event.tier,
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
      activeSections: event.activeSections as any,
      story: event.settings?.story || "",
      timeline: event.settings?.timeline || [],
      ceremony: event.settings?.ceremony || {},
      reception: event.settings?.reception || {},
      dressCode: event.settings?.dressCode || {},
      colors: event.settings?.colors || { primary: "#0F1B2D", secondary: "#C9A8A0", accent: "#D4AF7A" },
      giftRegistry: event.settings?.giftRegistry || [],
      rsvpDeadline: event.settings?.rsvpDeadline || "",
      clientName: event.settings?.client?.name || "",
      clientEmail: event.settings?.client?.email || "",
      clientPhone: event.settings?.client?.phone || "",
    }
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await updateEvent(event.id, data);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Ocurrió un error");
      }
    } catch (e) {
      setError("Error al conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActiveComponent = SECTIONS.find(s => s.id === activeTab)?.component || Step1BasicInfo;

  return (
    <div className="flex flex-col h-screen bg-muted/20">
      {/* Edit Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-8 py-4 shadow-sm relative z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{event.title}</h1>
            <p className="text-xs text-muted-foreground">Editando configuración del evento</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <span className="flex items-center gap-2 text-sm font-bold text-green-600 animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="h-4 w-4" /> Guardado
            </span>
          )}
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="shimmer flex items-center gap-2 rounded-xl border-none px-6 py-2.5 text-sm font-bold text-[var(--color-midnight)] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <aside className="w-72 border-r border-border bg-background/50 backdrop-blur-xl p-6 space-y-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeTab === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                  isActive 
                    ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)] shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-[var(--color-brand)]" : "text-muted-foreground")} />
                {section.title}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-12">
          <div className="mx-auto max-w-3xl">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <ActiveComponent />
                {error && (
                  <div className="mt-8 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}
              </form>
            </FormProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
