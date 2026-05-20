"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { 
  Save, ArrowLeft, Info, History, MapPin, 
  Shirt, Palette, CheckCircle2, Users, Gift, Settings, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

import { eventFormSchema, type EventFormData, type EventFormInput } from "@/types/event-form";
import { updateEvent } from "@/app/actions/events";
import { Step1BasicInfo } from "@/components/dashboard/wizard/Step1BasicInfo";
import { Step2Story } from "@/components/dashboard/wizard/Step2Story";
import { Step3Venues } from "@/components/dashboard/wizard/Step3Venues";
import { Step4DressCode } from "@/components/dashboard/wizard/Step4DressCode";
import { Step5Advanced } from "@/components/dashboard/wizard/Step5Advanced";

import { getWizardSteps } from "@/lib/wizard-config";

// Normaliza giftRegistry entre formatos viejos (objeto con digitalEnvelope/liverpool)
// y el nuevo (array de {store, url}). Permite que eventos legacy coexistan.
function normalizeGiftRegistry(raw: unknown): Array<{ store: string; url: string }> {
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is { store: string; url: string } =>
        !!item && typeof item === "object" && "store" in item && "url" in item
    );
  }
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, { enabled?: boolean; eventCode?: string }>;
    const arr: Array<{ store: string; url: string }> = [];
    if (obj.liverpool?.enabled && obj.liverpool.eventCode) {
      arr.push({
        store: "Liverpool",
        url: `https://www.liverpool.com.mx/tienda/mesa-regalos/${obj.liverpool.eventCode}`,
      });
    }
    return arr;
  }
  return [];
}

export default function EditEventClient({ event, isAdmin }: { event: any, isAdmin?: boolean }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("step-0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parse initial data
  // intake: campos guardados por el portal del cliente (settings.intake.*)
  // locFallback: locationName/Address son campos directos del evento que el intake siempre rellena
  const intake = (event.settings?.intake ?? {}) as Record<string, string>;
  const locName = event.locationName || "";
  const locAddr = event.locationAddress || "";

  const methods = useForm<EventFormInput, unknown, EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event.title || "",
      slug: event.slug || "",
      type: event.type || "WEDDING",
      tier: event.tier || "EXPRESS",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
      eventTime: event.settings?.eventTime || event.settings?.venue?.time || "",
      coverImage: event.coverImage || null,
      activeSections: event.activeSections || {},
      // WEDDING
      story: event.settings?.story || "",
      timeline: (event.settings?.timeline || []).map((t: any) => ({
        year: t.year || "",
        title: t.title || "",
        description: t.description || t.desc || "",
        image: t.image || ""
      })),
      // Ceremony: fallback a locationName del intake cuando el admin no lo ha editado aún
      ceremony: {
        venueName: event.settings?.ceremony?.venueName || event.settings?.ceremony?.name || locName,
        address: event.settings?.ceremony?.address || locAddr,
        time: event.settings?.ceremony?.time || "",
        mapsUrl: event.settings?.ceremony?.mapsUrl || "",
      },
      reception: {
        venueName: event.settings?.reception?.venueName || event.settings?.reception?.name || "",
        address: event.settings?.reception?.address || "",
        time: event.settings?.reception?.time || "",
        mapsUrl: event.settings?.reception?.mapsUrl || "",
      },
      // BIRTHDAY / XV: celebrantName fallback desde intake.honoree
      celebrantName: event.settings?.celebrantName || intake.honoree || "",
      celebrantAge: event.settings?.celebrantAge ?? undefined,
      bio: event.settings?.bio || "",
      funFacts: event.settings?.funFacts || [],
      // BIRTHDAY / BABY_SHOWER – lugar único: fallback a locationName del intake
      venue: {
        venueName: event.settings?.venue?.venueName || event.settings?.venue?.name || locName,
        address: event.settings?.venue?.address || locAddr,
        time: event.settings?.venue?.time || "",
        mapsUrl: event.settings?.venue?.mapsUrl || "",
      },
      wishList: event.settings?.wishList || [],
      // XV – misa y fiesta: fallback a locationName del intake en fiesta
      misa: {
        venueName: event.settings?.misa?.venueName || event.settings?.misa?.name || "",
        address: event.settings?.misa?.address || "",
        time: event.settings?.misa?.time || "",
        mapsUrl: event.settings?.misa?.mapsUrl || "",
      },
      fiesta: {
        venueName: event.settings?.fiesta?.venueName || event.settings?.fiesta?.name || locName,
        address: event.settings?.fiesta?.address || locAddr,
        time: event.settings?.fiesta?.time || "",
        mapsUrl: event.settings?.fiesta?.mapsUrl || "",
      },
      court: event.settings?.court || [],
      // BABY_SHOWER
      parentNames: {
        mom: event.settings?.parentNames?.mom || "",
        dad: event.settings?.parentNames?.dad || "",
      },
      babyName: event.settings?.babyName || intake.babyName || "",
      babyNameSurprise: event.settings?.babyNameSurprise || false,
      dueDate: event.settings?.dueDate || "",
      babyShowerTheme: event.settings?.babyShowerTheme || intake.theme || "",
      // Shared: dress code texto del intake como fallback
      dressCode: {
        title: event.settings?.dressCode?.title || event.settings?.dressCode?.name || intake.dressCode || "",
        description: event.settings?.dressCode?.description || "",
        images: event.settings?.dressCode?.images || [],
      },
      gallery: event.settings?.gallery || [],
      colors: event.settings?.colors || { primary: "#0F1B2D", secondary: "#C9A8A0", accent: "#D4AF7A" },
      giftRegistry: normalizeGiftRegistry(event.settings?.giftRegistry),
      rsvpDeadline: event.settings?.rsvpDeadline || "",
      // clientName/Email: primero campos directos del evento (managed-service flow)
      clientName: event.clientName || event.settings?.client?.name || event.settings?.clientName || "",
      clientEmail: event.clientEmail || event.settings?.client?.email || event.settings?.clientEmail || "",
      clientPhone: event.settings?.client?.phone || event.settings?.clientPhone || "",
      id: event.id,
    }
  });

  const { handleSubmit, formState: { errors: validationErrors } } = methods;

  const onInvalid = (errors: any) => {
    console.warn("Form Validation Errors:", errors);
    setError("Faltan campos por completar o hay errores en los datos. Revisa todos los pasos.");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const eventType = methods.watch("type") || "WEDDING";
  
  const getIconForTitle = (title: string) => {
    if (title.includes("Básico")) return Info;
    if (title.includes("Diseño") || title.includes("Tema")) return Palette;
    if (title.includes("Historia") || title.includes("festejado") || title.includes("bebé") || title.includes("historia")) return History;
    if (title.includes("Lugar")) return MapPin;
    if (title.includes("Dress")) return Shirt;
    if (title.includes("Corte")) return Users;
    if (title.includes("deseos") || title.includes("regalos")) return Gift;
    if (title.includes("Avanzado")) return Settings;
    return FileText;
  };

  const SECTIONS = getWizardSteps(eventType)
    .filter(step => step.title !== "Revisión")
    .map((step, idx) => ({
      id: `step-${idx}`,
      title: step.title,
      icon: getIconForTitle(step.title),
      component: step.component
    }));

  const ActiveComponent = SECTIONS.find(s => s.id === activeTab)?.component || SECTIONS[0].component;

  // Detect which sections have errors based on section title
  const hasErrors = (sectionTitle: string) => {
    if (sectionTitle.includes("Básico")) {
      return !!(validationErrors.title || validationErrors.slug || validationErrors.eventDate || validationErrors.clientName || validationErrors.clientEmail || validationErrors.type || validationErrors.tier);
    }
    if (sectionTitle.includes("Historia") || sectionTitle.includes("festejado") || sectionTitle.includes("bebé")) {
      return !!(validationErrors.story || validationErrors.timeline);
    }
    if (sectionTitle.includes("Lugar")) {
      return !!(validationErrors.ceremony || validationErrors.reception);
    }
    if (sectionTitle.includes("Dress")) {
      return !!(validationErrors.dressCode);
    }
    if (sectionTitle.includes("Avanzado") || sectionTitle.includes("Tema") || sectionTitle.includes("Diseño") || sectionTitle.includes("deseos")) {
      return !!(validationErrors.colors || validationErrors.giftRegistry || validationErrors.activeSections);
    }
    return false;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Edit Header */}
      <div className="sticky top-0 z-30 md:relative flex items-center justify-between border-b border-border bg-background/90 backdrop-blur-md px-4 md:px-8 py-3 md:py-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="group flex items-center justify-center rounded-full h-8 w-8 md:h-10 md:w-10 hover:bg-[var(--color-midnight)] hover:text-white transition-all duration-300 border border-border"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 group-active:-translate-x-1 transition-transform" />
          </button>
          <div className="overflow-hidden">
            <h1 className="text-sm md:text-xl font-bold text-foreground truncate tracking-tight">{event.title}</h1>
            <p className="hidden xs:block text-[10px] md:text-xs font-medium text-muted-foreground truncate uppercase tracking-widest">
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
      <div className="lg:hidden sticky top-[57px] md:top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl px-4 py-3 overflow-x-auto no-scrollbar flex items-center gap-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeTab === section.id;
          const sectionHasError = hasErrors(section.title);

          return (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={cn(
                "group relative flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 flex-shrink-0",
                isActive
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
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
        <aside className="hidden lg:block w-72 border-r border-border bg-card/40 backdrop-blur-sm p-8 space-y-3 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeTab === section.id;
            const sectionHasError = hasErrors(section.title);

            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300 group",
                  isActive
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "h-5 w-5 transition-colors duration-300", 
                    isActive ? "text-[var(--color-brand)]" : "text-muted-foreground/40 group-hover:text-muted-foreground"
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

          {/* Referencia del intake — visible para el admin mientras edita */}
          {(event.locationName || Object.keys(intake).length > 0 || event.intakeNotes) && (
            <div className="mx-auto max-w-4xl mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-amber-600">
                Datos del intake (referencia del cliente)
              </p>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {event.locationName && (
                  <div><dt className="font-semibold text-amber-700">Lugar</dt><dd className="text-amber-900">{event.locationName}</dd></div>
                )}
                {event.locationAddress && (
                  <div className="col-span-2"><dt className="font-semibold text-amber-700">Dirección</dt><dd className="text-amber-900">{event.locationAddress}</dd></div>
                )}
                {Object.entries(intake).map(([k, v]) => v ? (
                  <div key={k}><dt className="font-semibold text-amber-700 capitalize">{k}</dt><dd className="text-amber-900 truncate">{v}</dd></div>
                ) : null)}
                {event.intakeNotes && (
                  <div className="col-span-full"><dt className="font-semibold text-amber-700">Notas adicionales</dt><dd className="text-amber-900 whitespace-pre-wrap">{event.intakeNotes}</dd></div>
                )}
              </dl>
            </div>
          )}

          <div className="mx-auto max-w-4xl bg-card/60 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.02)] border border-border/60">

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <ActiveComponent isAdmin={isAdmin} hidePrice={true} />
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
