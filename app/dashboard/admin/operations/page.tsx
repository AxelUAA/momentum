import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ListChecks,
  ArrowRight,
  Clock,
  Zap,
  ShoppingBag,
  Sparkles,
  Heart,
  Crown,
  Cake,
  Baby,
  Droplets,
  GraduationCap,
  Building2,
  FileText,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { QuickStatusButton } from "./QuickStatusButton";

export const metadata = {
  title: "Cola de operaciones | Momentum Admin",
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const TYPE_ICON: Record<string, LucideIcon> = {
  WEDDING: Heart,
  XV: Crown,
  BIRTHDAY: Cake,
  BABY_SHOWER: Baby,
  BAPTISM: Droplets,
  GRADUATION: GraduationCap,
  CORPORATE: Building2,
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Invitación gratis (pendiente)",
  PAID: "Pago confirmado",
  INTAKE_COMPLETE: "Datos recibidos",
  BUILDING: "En construcción",
  REVIEW: "En revisión",
  CHANGES_REQUESTED: "Cambios solicitados",
  ACTIVE: "Activa",
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "badge-status-neutral",
  PAID: "badge-status-info",
  INTAKE_COMPLETE: "badge-status-info",
  BUILDING: "badge-status-warning",
  REVIEW: "badge-status-warning",
  CHANGES_REQUESTED: "badge-status-danger",
  ACTIVE: "badge-status-success",
};

/** Returns how long ago a date was as a human-readable string. */
function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} día${days > 1 ? "s" : ""}`;
}

/** Next action config per status. */
type QuickAction =
  | { label: string; nextStatus: string; variant?: "default" | "danger" | "success" }[];

function getQuickActions(status: string): QuickAction {
  switch (status) {
    case "DRAFT":
      return [{ label: "Activar invitación gratis", nextStatus: "ACTIVE", variant: "success" }];
    case "PAID":
      return [{ label: "Marcar como en construcción", nextStatus: "BUILDING" }];
    case "INTAKE_COMPLETE":
      return [{ label: "Iniciar construcción", nextStatus: "BUILDING" }];
    case "BUILDING":
      return [{ label: "Enviar a revisión", nextStatus: "REVIEW" }];
    case "REVIEW":
      return [
        { label: "Aprobar (activar)", nextStatus: "ACTIVE", variant: "success" },
        { label: "Solicitar cambios", nextStatus: "CHANGES_REQUESTED", variant: "danger" },
      ];
    case "CHANGES_REQUESTED":
      return [{ label: "Enviar a revisión de nuevo", nextStatus: "REVIEW" }];
    case "ACTIVE":
      return [{ label: "Marcar como completado", nextStatus: "COMPLETED" }];
    default:
      return [];
  }
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

// Statuses that appear in the operations queue
const QUEUE_STATUSES = [
  "DRAFT",
  "PAID",
  "INTAKE_COMPLETE",
  "BUILDING",
  "REVIEW",
  "CHANGES_REQUESTED",
  "ACTIVE",
] as const;

export default async function OperationsQueuePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (me?.role !== "ADMIN") redirect("/dashboard");

  const events = await prisma.event.findMany({
    where: { status: { in: [...QUEUE_STATUSES] } },
    orderBy: { updatedAt: "asc" }, // oldest first — most urgent
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
      updatedAt: true,
      subscriptionId: true,
      user: {
        select: {
          name: true,
          email: true,
          subscription: { select: { plan: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <ListChecks className="h-8 w-8 text-[var(--color-brand)]" />
          <h1
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Cola de operaciones
          </h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Invitaciones que requieren acción. Ordenadas por tiempo en el status actual (más antiguas primero).
        </p>
      </div>

      {/* Count pills by origin */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-brand)]">
          {events.length} pendiente{events.length !== 1 ? "s" : ""}
        </span>
        {events.some(e => !!e.subscriptionId) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            <Zap className="h-3 w-3" />
            {events.filter(e => !!e.subscriptionId).length} suscripción
          </span>
        )}
        {events.some(e => !e.subscriptionId && e.tier !== "FREE") && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <ShoppingBag className="h-3 w-3" />
            {events.filter(e => !e.subscriptionId && e.tier !== "FREE").length} compra directa
          </span>
        )}
        {events.some(e => e.tier === "FREE") && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            {events.filter(e => e.tier === "FREE").length} gratis
          </span>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-16 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-semibold">Todo al día</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No hay invitaciones pendientes de acción.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => {
            const isSubscription = !!ev.subscriptionId;
            const isFree = ev.tier === "FREE";
            const clientDisplayName = ev.clientName ?? ev.user.name ?? "—";
            const clientDisplayEmail = ev.clientEmail ?? ev.user.email ?? "—";
            const EventTypeIcon = TYPE_ICON[ev.type] ?? FileText;
            const actions = getQuickActions(ev.status);
            const badgeCls = STATUS_BADGE[ev.status] ?? "badge-status-neutral";

            const PLAN_SHORT: Record<string, string> = {
              ORGANIZADOR_PLUS: "Plus",
              ORGANIZADOR_PRO: "Pro",
            };

            return (
              <div
                key={ev.id}
                className={`group rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
                  isSubscription
                    ? "border-violet-200 bg-violet-50/40 dark:border-violet-900 dark:bg-violet-950/20"
                    : isFree
                    ? "border-border bg-card"
                    : "border-border bg-card"
                }`}
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Left: identity */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/70">
                        <EventTypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <h2 className="truncate text-base font-semibold text-foreground">
                        {ev.title}
                      </h2>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeCls}`}>
                        {STATUS_LABEL[ev.status] ?? ev.status}
                      </span>

                      {/* Origin badge */}
                      {isSubscription ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                          <Zap className="h-2.5 w-2.5" />
                          Suscripción{ev.user.subscription?.plan ? ` · ${PLAN_SHORT[ev.user.subscription.plan] ?? ""}` : ""}
                        </span>
                      ) : isFree ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <Sparkles className="h-2.5 w-2.5" />
                          Gratis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          <ShoppingBag className="h-2.5 w-2.5" />
                          Compra directa
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{clientDisplayName}</span>
                      <span>·</span>
                      <span>{clientDisplayEmail}</span>
                      {isSubscription && (
                        <>
                          <span>·</span>
                          <span className="text-violet-600 dark:text-violet-400 text-xs font-semibold">
                            Org: {ev.user.name ?? ev.user.email}
                          </span>
                        </>
                      )}
                      {ev.eventDate && (
                        <>
                          <span>·</span>
                          <span>
                            {new Date(ev.eventDate).toLocaleDateString("es-MX", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>En este status {timeAgo(ev.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Right: detail link */}
                  <Link
                    href={`/dashboard/admin/operations/${ev.id}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-4 py-2 text-xs font-semibold transition-all hover:bg-muted"
                  >
                    Ver detalles
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Subscription note */}
                {isSubscription && (
                  <div className="mt-3 rounded-xl bg-violet-100/60 dark:bg-violet-950/40 px-3 py-2 text-xs text-violet-700 dark:text-violet-300">
                    Este evento fue creado por un suscriptor. Él gestiona los datos — solo requiere activación.
                  </div>
                )}

                {/* Quick actions */}
                {actions.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Acción rápida:
                    </span>
                    {actions.map((action) => (
                      <QuickStatusButton
                        key={action.nextStatus}
                        eventId={ev.id}
                        nextStatus={action.nextStatus}
                        label={action.label}
                        variant={action.variant ?? "default"}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
