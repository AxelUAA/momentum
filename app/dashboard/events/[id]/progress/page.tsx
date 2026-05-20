import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { 
  CheckCircle2, 
  Clock, 
  FileEdit, 
  CheckCircle,
  Wrench,
  Eye,
  AlertCircle,
  PartyPopper,
  ExternalLink,
  ChevronLeft,
  QrCode,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addClientNote } from "@/app/actions/events";
import { ClientNoteForm } from "./ClientNoteForm"; // We will create this client component
import { SubmitEventButton } from "./SubmitEventButton";

// Next.js 15+ props signature
export default async function EventProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { 
      id,
      // If not admin, verify ownership
      ...(session.user.role === "ADMIN" ? {} : { userId: session.user.id })
    },
  });

  if (!event) notFound();

  // Status mapping
  const statuses = [
    "DRAFT",
    "UNPAID", // If we consider payment status separate, but here we merge logic conceptually
    "PAID",
    "INTAKE_COMPLETE",
    "BUILDING",
    "REVIEW",
    "CHANGES_REQUESTED",
    "ACTIVE"
  ];
  
  // Actually, we should map based on event.status and event.paymentStatus
  // For the sake of the user request, let's determine the conceptual "progress status"
  let currentProgressStatus = event.status as string;
  if (event.paymentStatus !== "PAID" && event.status === "DRAFT") {
    currentProgressStatus = "UNPAID";
  } else if (event.paymentStatus === "PAID" && event.status === "DRAFT") {
    currentProgressStatus = "PAID";
  }

  // To make math easy
  const getStatusIndex = (st: string) => statuses.indexOf(st);
  const currentIndex = getStatusIndex(currentProgressStatus);

  const timelineSteps = [
    {
      id: "PAID",
      icon: CheckCircle2,
      title: "Pago confirmado",
      description: "Tu pago ha sido procesado exitosamente.",
      isComplete: currentIndex >= getStatusIndex("PAID"),
      isActive: currentProgressStatus === "PAID"
    },
    {
      id: "INTAKE_COMPLETE",
      icon: CheckCircle,
      title: "Datos enviados",
      description: "Hemos recibido toda la información de tu evento.",
      isComplete: currentIndex >= getStatusIndex("INTAKE_COMPLETE"),
      isActive: currentProgressStatus === "INTAKE_COMPLETE"
    },
    {
      id: "BUILDING",
      icon: Wrench,
      title: "Construyendo tu invitación",
      description: "Nuestro equipo está trabajando en tu diseño.",
      isComplete: currentIndex > getStatusIndex("BUILDING"),
      isActive: currentProgressStatus === "BUILDING"
    },
    {
      id: "REVIEW",
      icon: Eye,
      title: "Lista para revisar",
      description: "Tu invitación está lista para tu aprobación.",
      isComplete: currentIndex > getStatusIndex("REVIEW") && currentProgressStatus !== "CHANGES_REQUESTED",
      isActive: currentProgressStatus === "REVIEW"
    },
    {
      id: "CHANGES_REQUESTED",
      icon: FileEdit,
      title: "Se requieren cambios",
      description: "Estamos aplicando tus comentarios.",
      isComplete: currentIndex > getStatusIndex("CHANGES_REQUESTED"),
      isActive: currentProgressStatus === "CHANGES_REQUESTED"
    },
    {
      id: "ACTIVE",
      icon: PartyPopper,
      title: "¡Tu invitación está activa!",
      description: "Lista para ser compartida con tus invitados.",
      isComplete: currentProgressStatus === "ACTIVE",
      isActive: currentProgressStatus === "ACTIVE"
    }
  ];

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/events"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-midnight)] dark:text-[var(--color-cream)]">
            Progreso: {event.title}
          </h1>
          <p className="text-muted-foreground">
            Sigue el estado de tu invitación paso a paso.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contextual Message Box (Takes up 2/3 space on desktop) */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-3xl border border-border bg-background p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-brand)]/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              {currentProgressStatus === "UNPAID" && (
                <div>
                  <div className="flex items-center gap-3 mb-4 text-amber-600">
                    <AlertCircle className="h-8 w-8" />
                    <h2 className="text-2xl font-bold text-foreground">Pendiente de Pago</h2>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6">
                    Tu invitación está en borrador. Realiza el pago para comenzar con el diseño de tu invitación.
                  </p>
                  <Link
                    href={`/dashboard/events`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-8 py-4 text-sm font-bold text-[var(--color-cream)] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
                  >
                    Ir a pagar
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              {currentProgressStatus === "PAID" && (
                <div>
                  <div className="flex items-center gap-3 mb-4 text-[var(--color-brand)]">
                    <CheckCircle2 className="h-8 w-8" />
                    <h2 className="text-2xl font-bold text-foreground">¡Pago Confirmado!</h2>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6">
                    Completa tus datos para que podamos empezar a construir tu invitación. Una vez termines, haz clic en enviar.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href={`/dashboard/events/${event.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-8 py-4 text-sm font-bold text-[var(--color-midnight)] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--color-brand)]/20"
                    >
                      Completar datos
                      <FileEdit className="h-4 w-4" />
                    </Link>
                    <SubmitEventButton eventId={event.id} />
                  </div>
                </div>
              )}

              {currentProgressStatus === "INTAKE_COMPLETE" && (
                <div>
                  <div className="flex items-center gap-3 mb-4 text-blue-500">
                    <CheckCircle className="h-8 w-8" />
                    <h2 className="text-2xl font-bold text-foreground">Información Recibida</h2>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    Recibimos todos tus datos. Nos tardamos 2-3 días hábiles en tener lista la primera versión.
                  </p>
                </div>
              )}

              {currentProgressStatus === "BUILDING" && (
                <div>
                  <div className="flex items-center gap-3 mb-4 text-amber-500">
                    <Wrench className="h-8 w-8" />
                    <h2 className="text-2xl font-bold text-foreground">En Construcción</h2>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    Estamos diseñando tu invitación. Te avisaremos en cuanto esté lista para que la revises.
                  </p>
                </div>
              )}

              {currentProgressStatus === "REVIEW" && (
                <div>
                  <div className="flex items-center gap-3 mb-4 text-purple-500">
                    <Eye className="h-8 w-8" />
                    <h2 className="text-2xl font-bold text-foreground">¡Lista para Revisión!</h2>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6">
                    ¡Lista! Revisa tu invitación y dinos si hay algún cambio que debamos hacer.
                  </p>
                  <a
                    href={`/e/${event.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-8 py-4 text-sm font-bold text-[var(--color-cream)] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
                  >
                    Ver invitación
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              {currentProgressStatus === "CHANGES_REQUESTED" && (
                <div>
                  <div className="flex items-center gap-3 mb-4 text-orange-500">
                    <FileEdit className="h-8 w-8" />
                    <h2 className="text-2xl font-bold text-foreground">Cambios Solicitados</h2>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6">
                    El administrador necesita que revises algo o nos has pedido ajustes. Por favor déjanos una nota.
                  </p>
                  
                  <ClientNoteForm eventId={event.id} />
                </div>
              )}

              {currentProgressStatus === "ACTIVE" && (
                <div>
                  <div className="flex items-center gap-3 mb-4 text-green-500">
                    <PartyPopper className="h-8 w-8" />
                    <h2 className="text-2xl font-bold text-foreground">¡Tu invitación está ACTIVA! 🎉</h2>
                  </div>
                  <p className="text-muted-foreground text-lg mb-8">
                    Todo está listo. Ya puedes compartir el enlace con tus invitados o usar tu código QR.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <a
                      href={`/e/${event.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-8 py-4 text-sm font-bold text-[var(--color-midnight)] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--color-brand)]/20"
                    >
                      Ver Invitación
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-8 py-4 text-sm font-bold transition-all hover:bg-muted"
                    >
                      <QrCode className="h-4 w-4" />
                      Descargar QR
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline (Takes up 1/3 space on desktop) */}
        <div className="rounded-3xl border border-border bg-background p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <h3 className="font-bold text-xl mb-8 text-foreground">Línea de Tiempo</h3>
          
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {timelineSteps.map((step, idx) => (
              <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 relative z-10",
                  step.isComplete ? "bg-[var(--color-brand)] border-[var(--color-brand)]/20 text-[var(--color-midnight)]" : 
                  step.isActive ? "bg-background border-[var(--color-brand)] text-[var(--color-brand)] shadow-[0_0_10px_rgba(212,175,122,0.3)]" : 
                  "bg-muted border-background text-muted-foreground"
                )}>
                  <step.icon className={cn("w-5 h-5", step.isComplete ? "text-[var(--color-midnight)]" : "")} />
                </div>
                
                {/* Text Content */}
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:odd:pr-6 md:even:pl-6">
                  <h4 className={cn(
                    "font-bold text-base",
                    step.isComplete || step.isActive ? "text-foreground" : "text-muted-foreground"
                  )}>{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
