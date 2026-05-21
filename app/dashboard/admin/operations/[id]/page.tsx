import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle2,
  CheckCircle,
  Wrench,
  Eye,
  FileEdit,
  PartyPopper,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickStatusButton } from "../QuickStatusButton";
import { getTierFeatures, TIER_INFO } from "@/lib/event-sections-map";

export const metadata = {
  title: "Detalle de operación | Momentum Admin",
};

/* ─── TYPE_FIELDS mirror ─────────────────────────────────────────────────── */
// Mirror of IntakeForm.tsx TYPE_FIELDS so we can render intake data server-side.

type FieldDef = { key: string; label: string };

const TYPE_FIELDS: Record<string, FieldDef[]> = {
  WEDDING: [
    { key: "coupleName",   label: "Nombres de la pareja" },
    { key: "ceremonyType", label: "Tipo de ceremonia" },
    { key: "colors",       label: "Colores del evento" },
    { key: "dressCode",    label: "Código de vestimenta" },
    { key: "giftRegistry", label: "Mesa de regalos" },
    { key: "guestCount",   label: "Invitados aprox." },
  ],
  XV: [
    { key: "honoree",     label: "Nombre de la quinceañera" },
    { key: "theme",       label: "Tema o estilo" },
    { key: "colors",      label: "Colores del evento" },
    { key: "chambelanes", label: "Chambelanes" },
    { key: "guestCount",  label: "Invitados aprox." },
  ],
  BIRTHDAY: [
    { key: "honoree",    label: "Nombre del festejado" },
    { key: "age",        label: "Años que cumple" },
    { key: "theme",      label: "Tema o estilo" },
    { key: "colors",     label: "Colores del evento" },
    { key: "guestCount", label: "Invitados aprox." },
  ],
  CORPORATE: [
    { key: "company",    label: "Empresa / organización" },
    { key: "eventKind",  label: "Tipo de evento" },
    { key: "dressCode",  label: "Dress code" },
    { key: "guestCount", label: "Asistentes aprox." },
  ],
  BAPTISM: [
    { key: "honoree",    label: "Nombre del bebé" },
    { key: "colors",     label: "Colores del evento" },
    { key: "guestCount", label: "Invitados aprox." },
  ],
  GRADUATION: [
    { key: "honoree",    label: "Nombre del graduado" },
    { key: "school",     label: "Escuela / universidad" },
    { key: "degree",     label: "Carrera o nivel" },
    { key: "guestCount", label: "Invitados aprox." },
  ],
  BABY_SHOWER: [
    { key: "honoree",    label: "Nombre de la mamá" },
    { key: "babyName",   label: "Nombre del bebé (si ya tienen)" },
    { key: "theme",      label: "Tema o estilo" },
    { key: "colors",     label: "Colores del evento" },
    { key: "guestCount", label: "Invitados aprox." },
  ],
};

const TYPE_EMOJI: Record<string, string> = {
  WEDDING: "💍",
  XV: "👑",
  BIRTHDAY: "🎂",
  BABY_SHOWER: "🍼",
  BAPTISM: "🕊️",
  GRADUATION: "🎓",
  CORPORATE: "🏢",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Gratis — pendiente de activación",
  PAID: "Pago confirmado",
  INTAKE_COMPLETE: "Datos recibidos",
  BUILDING: "En construcción",
  REVIEW: "En revisión",
  CHANGES_REQUESTED: "Cambios solicitados",
  ACTIVE: "Activa",
  COMPLETED: "Completada",
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "badge-status-neutral",
  PAID: "badge-status-info",
  INTAKE_COMPLETE: "badge-status-info",
  BUILDING: "badge-status-warning",
  REVIEW: "badge-status-warning",
  CHANGES_REQUESTED: "badge-status-danger",
  ACTIVE: "badge-status-success",
  COMPLETED: "badge-status-neutral",
};

/* ─── Timeline step config ───────────────────────────────────────────────── */

const ORDERED_STATUSES = [
  "DRAFT",
  "PAID",
  "INTAKE_COMPLETE",
  "BUILDING",
  "REVIEW",
  "CHANGES_REQUESTED",
  "ACTIVE",
];

type StepAction = {
  label: string;
  nextStatus: string;
  variant?: "default" | "success" | "danger";
};

const STEP_ACTIONS: Record<string, StepAction[]> = {
  DRAFT: [{ label: "Activar invitación gratis", nextStatus: "ACTIVE", variant: "success" }],
  PAID: [{ label: "Iniciar construcción", nextStatus: "BUILDING" }],
  INTAKE_COMPLETE: [{ label: "Iniciar construcción", nextStatus: "BUILDING" }],
  BUILDING: [{ label: "Enviar a revisión", nextStatus: "REVIEW" }],
  REVIEW: [
    { label: "Aprobar y activar", nextStatus: "ACTIVE", variant: "success" },
    { label: "Solicitar cambios", nextStatus: "CHANGES_REQUESTED", variant: "danger" },
  ],
  CHANGES_REQUESTED: [
    { label: "Volver a revisión", nextStatus: "REVIEW" },
  ],
  ACTIVE: [
    { label: "Marcar como completado", nextStatus: "COMPLETED" },
  ],
};

const STEP_META = [
  {
    id: "DRAFT",
    icon: FileEdit,
    title: "Invitación gratis",
    description: "El cliente creó una invitación gratis con datos básicos.",
  },
  {
    id: "PAID",
    icon: CheckCircle2,
    title: "Pago confirmado",
    description: "El cliente pagó y el evento está listo para recibir datos.",
  },
  {
    id: "INTAKE_COMPLETE",
    icon: CheckCircle,
    title: "Datos enviados",
    description: "El cliente completó el formulario de intake.",
  },
  {
    id: "BUILDING",
    icon: Wrench,
    title: "En construcción",
    description: "El equipo está diseñando la invitación.",
  },
  {
    id: "REVIEW",
    icon: Eye,
    title: "Lista para revisión",
    description: "El cliente puede revisar y aprobar.",
  },
  {
    id: "CHANGES_REQUESTED",
    icon: FileEdit,
    title: "Cambios solicitados",
    description: "Se aplican los ajustes del cliente.",
  },
  {
    id: "ACTIVE",
    icon: PartyPopper,
    title: "Invitación activa",
    description: "Lista para compartir con los invitados.",
  },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function OperationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (me?.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      status: true,
      tier: true,
      clientName: true,
      clientEmail: true,
      clientToken: true,
      eventDate: true,
      locationName: true,
      locationAddress: true,
      intakeNotes: true,
      settings: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!event) notFound();

  /* ── Derived data ─────────────────────────────────────────────────────── */

  const currentIdx = ORDERED_STATUSES.indexOf(event.status);
  const typeEmoji = TYPE_EMOJI[event.type] ?? "📋";
  const badgeCls = STATUS_BADGE[event.status] ?? "badge-status-neutral";

  const clientDisplayName = event.clientName ?? event.user.name ?? "—";
  const clientDisplayEmail = event.clientEmail ?? event.user.email ?? "—";

  const settings = (event.settings ?? {}) as Record<string, unknown>;
  const intakeData = (settings.intake ?? {}) as Record<string, string>;
  const typeFieldDefs = TYPE_FIELDS[event.type] ?? [];
  const hasIntakeData = event.status !== "PAID";

  const features = getTierFeatures(event.tier);
  const tierInfo = TIER_INFO[event.tier as keyof typeof TIER_INFO];
  const guestCount = await prisma.guest.count({ where: { eventId: event.id } });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://momentuminvites.com";

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard/admin/operations"
        className="inline-flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
      >
        <ChevronLeft className="h-4 w-4" />
        Cola de operaciones
      </Link>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl">{typeEmoji}</span>
              <h1
                className="text-2xl font-bold tracking-tight md:text-3xl"
                style={{ fontFamily: "var(--font-fraunces), serif" }}
              >
                {event.title}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${badgeCls}`}
              >
                {STATUS_LABEL[event.status] ?? event.status}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">Cliente:</span>{" "}
                {clientDisplayName}
              </span>
              <span>·</span>
              <span>{clientDisplayEmail}</span>
              <span>·</span>
              <span className="font-semibold text-foreground">
                {tierInfo?.label ?? event.tier}
              </span>
              {event.eventDate && (
                <>
                  <span>·</span>
                  <span>
                    Evento:{" "}
                    {new Date(event.eventDate).toLocaleDateString("es-MX", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-2">
            <a
              href={`/e/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-semibold transition-all hover:bg-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver invitación
            </a>
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-semibold transition-all hover:bg-muted"
            >
              Editar
            </Link>
            {event.clientToken && (
              <a
                href={`${baseUrl}/portal/${event.clientToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-semibold transition-all hover:bg-muted"
              >
                Portal del cliente
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── LEFT: Status timeline ─────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold">Flujo de status</h2>

            <div className="relative space-y-6">
              {STEP_META.map((step, idx) => {
                const Icon = step.icon;
                const isComplete = currentIdx > idx;
                const isActive = event.status === step.id;
                const actions = STEP_ACTIONS[step.id] ?? [];

                return (
                  <div key={step.id} className="relative flex gap-4">
                    {/* Connector line */}
                    {idx < STEP_META.length - 1 && (
                      <div
                        className={cn(
                          "absolute left-4 top-10 h-full w-px",
                          isComplete ? "bg-[var(--color-brand)]" : "bg-border"
                        )}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                        isComplete
                          ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-midnight)]"
                          : isActive
                          ? "border-[var(--color-brand)] bg-background text-[var(--color-brand)] shadow-[0_0_10px_rgba(212,175,122,0.3)]"
                          : "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isComplete || isActive
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>

                      {/* Action buttons for active step */}
                      {isActive && actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {actions.map((action) => (
                            <QuickStatusButton
                              key={action.nextStatus}
                              eventId={event.id}
                              nextStatus={action.nextStatus}
                              label={action.label}
                              variant={action.variant ?? "default"}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar quick links */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Accesos directos
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href={`/e/${event.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                Ver invitación en vivo
              </a>
              <Link
                href={`/dashboard/events/${event.id}/edit`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <FileEdit className="h-4 w-4 text-muted-foreground" />
                Editar invitación
              </Link>
              {event.clientToken && (
                <a
                  href={`${baseUrl}/portal/${event.clientToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  Portal del cliente
                </a>
              )}
            </div>
          </div>

          {/* Plan del cliente */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Plan del cliente
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{tierInfo?.label ?? event.tier}</span>
                <span className="text-sm font-semibold text-[var(--color-brand)]">
                  {tierInfo ? (tierInfo.price === 0 ? "Gratis" : `$${tierInfo.price.toLocaleString()} MXN`) : "—"}
                </span>
              </div>

              <div className="rounded-xl bg-muted/40 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invitados</span>
                  <span className="font-bold">
                    {guestCount} / {features.maxGuests !== null ? features.maxGuests : "Ilimitados"}
                  </span>
                </div>
                {features.maxGuests !== null && (
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-brand)] transition-all"
                      style={{ width: `${Math.min(100, (guestCount / features.maxGuests) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {([
                  ["RSVP", features.rsvp],
                  ["Galería", features.gallery],
                  ["Mapa", features.map],
                  ["Cuenta regresiva", features.countdown],
                  ["Código de vestimenta", features.dressCode],
                  ["Mesa de regalos", features.giftRegistry],
                  ["Spotify", features.spotify],
                  ["Libro de visitas", features.guestbook],
                  ["WhatsApp Generator", features.whatsappGenerator],
                ] as const).map(([label, enabled]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className={enabled ? "text-foreground" : "text-muted-foreground/50"}>{label}</span>
                    <span className={enabled ? "text-emerald-600 font-bold" : "text-muted-foreground/30"}>
                      {enabled ? "✓" : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Intake data ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Intake fields */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Datos del intake</h2>

            {!hasIntakeData ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    El cliente aún no ha enviado sus datos
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    El formulario de intake estará disponible una vez que el cliente acceda a su portal.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Base fields */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Información general
                  </p>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoRow label="Fecha del evento">
                      {event.eventDate
                        ? new Date(event.eventDate).toLocaleDateString("es-MX", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </InfoRow>
                    <InfoRow label="Lugar / salón">
                      {event.locationName || "—"}
                    </InfoRow>
                    <InfoRow label="Dirección" className="sm:col-span-2">
                      {event.locationAddress || "—"}
                    </InfoRow>
                  </dl>
                </div>

                {/* Type-specific fields */}
                {typeFieldDefs.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {TYPE_EMOJI[event.type]} Datos específicos del evento
                    </p>
                    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {typeFieldDefs.map((f) => (
                        <InfoRow key={f.key} label={f.label}>
                          {intakeData[f.key] || "—"}
                        </InfoRow>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Client notes history */}
          {(event.intakeNotes || (Array.isArray(settings.clientNotes) && settings.clientNotes.length > 0)) && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold">Historial de notas</h2>
              
              {event.intakeNotes && (
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Nota inicial (Intake)
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                    {event.intakeNotes}
                  </p>
                </div>
              )}

              {Array.isArray(settings.clientNotes) && settings.clientNotes.map((note: any, i: number) => (
                <div key={i} className="rounded-xl bg-muted/40 p-4 border border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand)]">
                      {note.role === "ADMIN" ? "Admin" : "Cliente"}
                    </p>
                    {note.createdAt && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString("es-MX", { 
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" 
                        })}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Edit CTA */}
          <div className="flex justify-end">
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-5 py-2.5 text-sm font-semibold text-[var(--color-cream)] transition-all hover:bg-[var(--color-midnight)]/80 active:scale-95"
            >
              <FileEdit className="h-4 w-4" />
              Editar datos de la invitación
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Small helper component ─────────────────────────────────────────────── */

function InfoRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-muted/40 p-3", className)}>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}
