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
      title: event.title || "",
      slug: event.slug || "",
      type: event.type || "WEDDING",
      tier: event.tier || "EXPRESS",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
      eventTime: event.settings?.eventTime || "",
      activeSections: event.activeSections || {},
      story: event.settings?.story || "",
      timeline: event.settings?.timeline || [],
      ceremony: {
        venueName: event.settings?.ceremony?.venueName || "",
        address: event.settings?.ceremony?.address || "",
        time: event.settings?.ceremony?.time || "",
        mapsUrl: event.settings?.ceremony?.mapsUrl || "",
      },
      reception: {
        venueName: event.settings?.reception?.venueName || "",
        address: event.settings?.reception?.address || "",
        time: event.settings?.reception?.time || "",
        mapsUrl: event.settings?.reception?.mapsUrl || "",
      },
      dressCode: {
        title: event.settings?.dressCode?.title || "",
        description: event.settings?.dressCode?.description || "",
        inspirationImages: event.settings?.dressCode?.inspirationImages || ["", "", "", ""],
      },
      colors: event.settings?.colors || { primary: "#0F1B2D", secondary: "#C9A8A0", accent: "#D4AF7A" },
      giftRegistry: event.settings?.giftRegistry || [],
      rsvpDeadline: event.settings?.rsvpDeadline || "",
      clientName: event.settings?.client?.name || event.settings?.clientName || "",
      clientEmail: event.settings?.client?.email || event.settings?.clientEmail || "",
      clientPhone: event.settings?.client?.phone || event.settings?.clientPhone || "",
    }
  });

  const { handleSubmit, formState: { errors: validationErrors } } = methods;

  const onInvalid = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    setError("Faltan campos por completar o hay errores en los datos. Revisa todos los pasos.");
    // Desplazar hacia arriba para ver el error
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await updateEvent(event.id, data);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      } else {
        setError(result.error || "Ocurrió un error al guardar");
      }
    } catch (e) {
      setError("Error al conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActiveComponent = SECTIONS.find(s => s.id === activeTab)?.component || Step1BasicInfo;

  // Detect which sections have errors
  const hasErrors = (sectionId: string) => {
    switch (sectionId) {
      case "basic":
        return !!(validationErrors.title || validationErrors.slug || validationErrors.eventDate || validationErrors.clientName || validationErrors.clientEmail || validationErrors.type || validationErrors.tier);
      case "story":
        return !!(validationErrors.story || validationErrors.timeline);
      case "venues":
        return !!(validationErrors.ceremony || validationErrors.reception);
      case "dress":
        return !!(validationErrors.dressCode);
      case "advanced":
        return !!(validationErrors.colors || validationErrors.giftRegistry || validationErrors.activeSections);
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F2EDE4]/30">
      {/* Edit Header */}
      <div className="sticky top-0 z-30 md:relative flex items-center justify-between border-b border-black/5 bg-white/70 backdrop-blur-md px-4 md:px-8 py-3 md:py-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="group flex items-center justify-center rounded-full h-8 w-8 md:h-10 md:w-10 hover:bg-[var(--color-midnight)] hover:text-white transition-all duration-300 border border-black/5"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 group-active:-translate-x-1 transition-transform" />
          </button>
          <div className="overflow-hidden">
            <h1 className="text-sm md:text-xl font-bold text-[var(--color-midnight)] truncate tracking-tight">{event.title}</h1>
            <p className="hidden xs:block text-[10px] md:text-xs font-medium text-[var(--color-midnight)]/40 truncate uppercase tracking-widest">
              Configuración del Evento
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {success && (
            <span className="hidden sm:flex items-center gap-2 text-xs md:text-sm font-bold text-emerald-600 animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="h-4 w-4" /> Guardado
            </span>
          )}
          <button
            type="button"
            onClick={handleSubmit(onSubmit, onInvalid)}
            disabled={isSubmitting}
            className="relative overflow-hidden flex items-center gap-2 rounded-full bg-[var(--color-midnight)] px-4 md:px-8 py-2 md:py-2.5 text-xs md:text-sm font-bold text-white shadow-lg shadow-[var(--color-midnight)]/10 hover:shadow-[var(--color-midnight)]/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {isSubmitting ? "..." : (
              <span>
                <span className="hidden xs:inline">Guardar cambios</span>
                <span className="xs:hidden">Guardar</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Tabs Scrollable - Premium Glassmorphism Look */}
      <div className="lg:hidden sticky top-[57px] md:top-0 z-20 border-b border-black/5 bg-[#F2EDE4]/60 backdrop-blur-xl px-4 py-3 overflow-x-auto no-scrollbar flex items-center gap-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeTab === section.id;
          const sectionHasError = hasErrors(section.id);

          return (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={cn(
                "group relative flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 flex-shrink-0",
                isActive 
                  ? "bg-white text-[var(--color-midnight)] shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-black/5 scale-105" 
                  : "text-[var(--color-midnight)]/40 hover:text-[var(--color-midnight)] hover:bg-white/50"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "text-[var(--color-brand)]" : "text-current")} />
              {section.title}
              {sectionHasError && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1">
        {/* Desktop Sidebar Tabs */}
        <aside className="hidden lg:block w-72 border-r border-black/5 bg-white/30 backdrop-blur-sm p-8 space-y-3 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeTab === section.id;
            const sectionHasError = hasErrors(section.id);

            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300 group",
                  isActive 
                    ? "bg-white text-[var(--color-midnight)] shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-black/5" 
                    : "text-[var(--color-midnight)]/40 hover:bg-white/50 hover:text-[var(--color-midnight)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "h-5 w-5 transition-colors duration-300", 
                    isActive ? "text-[var(--color-brand)]" : "text-[var(--color-midnight)]/20 group-hover:text-[var(--color-midnight)]/40"
                  )} />
                  {section.title}
                </div>
                {sectionHasError && (
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                )}
              </button>
            );
          })}
        </aside>


        {/* Content Area */}
        <main className="flex-1 p-6 md:p-12 overflow-x-hidden">
          <div className="mx-auto max-w-4xl bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.02)] border border-white/60">

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
