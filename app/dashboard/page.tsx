import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Star, Plus, Calendar, Users, Zap, CheckCircle2, Clock, AlertTriangle, ArrowRight, Sparkles, Crown, Palette } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

import { RsvpChart } from "@/components/dashboard/RsvpChart";

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_EMOJI: Record<string, string> = {
  WEDDING: "💍", XV: "👑", BIRTHDAY: "🎂",
  BABY_SHOWER: "🍼", BAPTISM: "🕊️", GRADUATION: "🎓", CORPORATE: "🏢",
};

const STATUS_STEPS = [
  { key: "PAID",              label: "Pago confirmado",    emoji: "💳" },
  { key: "INTAKE_COMPLETE",   label: "Datos recibidos",    emoji: "📋" },
  { key: "BUILDING",          label: "Construyendo",       emoji: "🎨" },
  { key: "REVIEW",            label: "Lista para revisar", emoji: "👁️" },
  { key: "CHANGES_REQUESTED", label: "Ajustes en proceso", emoji: "✏️" },
  { key: "ACTIVE",            label: "¡Activa!",           emoji: "🎉" },
];
const STATUS_ORDER = ["PAID","INTAKE_COMPLETE","BUILDING","REVIEW","CHANGES_REQUESTED","ACTIVE","COMPLETED"];

const PLAN_LABEL: Record<string, string> = {
  ORGANIZADOR_PLUS: "Organizador Plus",
  ORGANIZADOR_PRO:  "Organizador Pro",
};

const PLAN_LIMIT: Record<string, number> = {
  ORGANIZADOR_PLUS: 5,
  ORGANIZADOR_PRO: 20,
};

const TEMPLATES = [
  { slug: "aurora",   name: "Aurora",    emoji: "💍", desc: "Bodas",         color: "bg-rose-50 dark:bg-rose-950/30" },
  { slug: "confetti", name: "Confetti",  emoji: "🎂", desc: "Cumpleaños",    color: "bg-yellow-50 dark:bg-yellow-950/30" },
  { slug: "bloom",    name: "Bloom",     emoji: "👑", desc: "XV años",       color: "bg-purple-50 dark:bg-purple-950/30" },
  { slug: "nube",     name: "Nube",      emoji: "🍼", desc: "Baby Shower",   color: "bg-blue-50 dark:bg-blue-950/30" },
];

const PLAN_FEATURES: Record<string, string[]> = {
  ORGANIZADOR_PLUS: [
    "Hasta 5 eventos activos simultáneos",
    "Todas las plantillas incluidas",
    "RSVP digital con confirmación",
    "Gestión de invitados ilimitada",
    "Analytics de vistas",
    "Soporte por email",
  ],
  ORGANIZADOR_PRO: [
    "Hasta 20 eventos activos simultáneos",
    "Todas las plantillas incluidas",
    "RSVP digital con confirmación",
    "Gestión de invitados ilimitada",
    "Analytics de vistas",
    "Soporte prioritario",
  ],
};

// ── Subscriber home ──────────────────────────────────────────────────────────

async function SubscriberHome({
  userId,
  userName,
  plan,
  subscriptionId,
  usedSlots,
  planLimit,
}: {
  userId: string;
  userName: string;
  plan: string;
  subscriptionId: string;
  usedSlots: number;
  planLimit: number;
}) {
  const events = await prisma.event.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, slug: true, type: true,
      status: true, tier: true, eventDate: true,
      paymentStatus: true, subscriptionId: true,
      _count: { select: { guests: true } },
    },
  });

  const activeEvents  = events.filter(e => e.status === "ACTIVE");
  const draftEvents   = events.filter(e => e.status === "DRAFT");
  const totalGuests   = events.reduce((acc, e) => acc + e._count.guests, 0);
  const upcoming      = events
    .filter(e => e.eventDate && differenceInDays(new Date(e.eventDate), new Date()) >= 0)
    .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime())
    .slice(0, 1)[0];

  const slotsLeft   = planLimit - usedSlots;
  const atLimit     = slotsLeft <= 0;
  const nearLimit   = !atLimit && slotsLeft <= 1;
  const usagePct    = Math.min(100, Math.round((usedSlots / planLimit) * 100));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--color-brand)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">
              {PLAN_LABEL[plan] ?? plan}
            </span>
          </div>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Hola, {userName} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {events.length === 0
              ? "Crea tu primer evento para comenzar."
              : `Tienes ${events.length} evento${events.length !== 1 ? "s" : ""} en tu workspace.`}
          </p>
        </div>
        {atLimit ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Límite de plan alcanzado
          </div>
        ) : (
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-5 py-2.5 text-sm font-bold text-[var(--color-cream)] hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nuevo evento
          </Link>
        )}
      </div>

      {/* Plan usage bar */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Uso del plan</span>
          <span className={cn(
            "text-xs font-bold",
            atLimit ? "text-red-500" : nearLimit ? "text-amber-500" : "text-[var(--color-brand)]"
          )}>
            {usedSlots} / {planLimit} eventos pagados
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              atLimit ? "bg-red-500" : nearLimit ? "bg-amber-500" : "bg-[var(--color-brand)]"
            )}
            style={{ width: `${usagePct}%` }}
          />
        </div>
        {atLimit && (
          <p className="mt-2 text-xs text-red-500">
            Alcanzaste el límite de tu plan. <Link href="/dashboard/billing" className="underline font-bold">Actualiza tu suscripción</Link> para crear más eventos.
          </p>
        )}
        {nearLimit && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Te queda {slotsLeft} evento disponible en tu plan.
          </p>
        )}
      </div>

      {/* Plan benefits + templates */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Beneficios */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-4 w-4 text-[var(--color-brand)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Incluido en tu plan
            </span>
          </div>
          <ul className="space-y-2">
            {(PLAN_FEATURES[plan] ?? []).map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/billing"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand)] hover:underline"
          >
            Gestionar plan <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Templates disponibles */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-4 w-4 text-[var(--color-brand)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Plantillas disponibles
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => (
              <div
                key={t.slug}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${t.color}`}
              >
                <span className="text-xl">{t.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {!atLimit && (
            <Link
              href="/dashboard/events/new"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand)] hover:underline"
            >
              Crear evento con plantilla <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Publicados</p>
          <p className="mt-2 text-4xl font-black text-[var(--color-brand)]">{activeEvents.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">activos ahora</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Borradores</p>
          <p className="mt-2 text-4xl font-black">{draftEvents.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">sin publicar</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Invitados</p>
          <p className="mt-2 text-4xl font-black">{totalGuests}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">en todos tus eventos</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Próximo evento</p>
          {upcoming ? (
            <>
              <p className="mt-2 text-lg font-black truncate">{upcoming.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {format(new Date(upcoming.eventDate!), "d MMM yyyy", { locale: es })}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-xl font-bold">Aún no tienes eventos</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Crea tu primer evento y publícalo directamente desde tu workspace.
          </p>
          {!atLimit && (
            <Link
              href="/dashboard/events/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-6 py-3 text-sm font-bold text-[var(--color-cream)] hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Crear primer evento
            </Link>
          )}
        </div>
      ) : (
        /* Events grid */
        <div>
          <h2 className="mb-4 text-lg font-bold">Tus eventos</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
              const isActive = event.status === "ACTIVE";
              const isPaid   = event.paymentStatus === "PAID";
              const daysLeft = event.eventDate
                ? differenceInDays(new Date(event.eventDate), new Date())
                : null;

              return (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-brand)]/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{TYPE_EMOJI[event.type] ?? "📋"}</span>
                      <p className="font-bold truncate text-foreground">{event.title}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        isActive ? "badge-status-success" :
                        isPaid ? "badge-status-info" :
                        "bg-muted text-muted-foreground"
                      )}
                    >
                      {isActive ? "Activa" : isPaid ? "Lista" : "Borrador"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-xl bg-muted/40 py-2">
                      <p className="text-lg font-black">{event._count.guests}</p>
                      <p className="text-[10px] text-muted-foreground">Invitados</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 py-2">
                      {daysLeft !== null ? (
                        <>
                          <p className={cn("text-lg font-black", daysLeft <= 7 && "text-amber-500")}>
                            {daysLeft >= 0 ? daysLeft : "—"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {daysLeft >= 0 ? "días" : "pasado"}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-black">—</p>
                          <p className="text-[10px] text-muted-foreground">sin fecha</p>
                        </>
                      )}
                    </div>
                  </div>

                  {event.eventDate && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {format(new Date(event.eventDate), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Client home ───────────────────────────────────────────────────────────────

const TIER_LABEL: Record<string, string> = {
  FREE: "Gratis", EXPRESS: "Express", ESSENTIAL: "Esencial", COMPLETE: "Completa", LUXURY: "Premium",
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  DRAFT:             { label: "En revisión",   cls: "bg-muted text-muted-foreground" },
  PAID:              { label: "Datos pendientes", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" },
  INTAKE_COMPLETE:   { label: "En proceso",    cls: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" },
  BUILDING:          { label: "Construyendo",  cls: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400" },
  REVIEW:            { label: "En revisión",   cls: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400" },
  CHANGES_REQUESTED: { label: "Ajustes",       cls: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400" },
  ACTIVE:            { label: "Activa",        cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
  COMPLETED:         { label: "Completada",    cls: "bg-muted text-muted-foreground" },
};

async function ClientHome({ userId, userName }: { userId: string; userName: string }) {
  // Include all events: paid + free (DRAFT/UNPAID)
  const events = await prisma.event.findMany({
    where: {
      userId,
      OR: [
        { paymentStatus: "PAID" },
        { tier: "FREE" },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, slug: true, type: true,
      status: true, tier: true,
      eventDate: true, activeUntil: true,
      _count: { select: { guests: true } },
    },
  });

  if (events.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-fraunces), serif" }}>
            Hola, {userName} 👋
          </h1>
          <p className="mt-2 text-muted-foreground">Bienvenido a Momentum</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Paid invitation */}
          <Link
            href="/plantillas"
            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center hover:border-[var(--color-champagne)]/60 hover:bg-[var(--color-champagne)]/5 transition-all"
          >
            <Star className="mb-3 h-10 w-10 text-[var(--color-champagne)]/50 group-hover:text-[var(--color-champagne)] transition-colors" />
            <p className="font-bold text-lg">Crear invitación</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
              Elige una plantilla premium y compra tu invitación
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-champagne)]">
              Ver plantillas <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Free invitation */}
          <Link
            href="/dashboard/nueva-gratis"
            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center hover:border-[var(--color-champagne)]/60 hover:bg-[var(--color-champagne)]/5 transition-all"
          >
            <Sparkles className="mb-3 h-10 w-10 text-muted-foreground/40 group-hover:text-[var(--color-champagne)] transition-colors" />
            <p className="font-bold text-lg">Invitación gratis</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
              Prueba cómo funciona con información limitada
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-[var(--color-champagne)] transition-colors">
              Crear gratis <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-fraunces), serif" }}>
            Hola, {userName} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {events.length === 1 ? "Tu invitación" : `Tus ${events.length} invitaciones`}
          </p>
        </div>
        <Link
          href="/plantillas"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-4 py-2.5 text-sm font-bold text-[var(--color-cream)] hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nueva invitación
        </Link>
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => {
          const isActive = event.status === "ACTIVE" || event.status === "COMPLETED";
          const isFree = event.tier === "FREE";
          const badge = STATUS_BADGE[event.status] ?? STATUS_BADGE.DRAFT;
          const needsAction = event.status === "PAID";

          return (
            <Link
              key={event.id}
              href={`/dashboard/mi-invitacion/${event.id}`}
              className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-[var(--color-champagne)]/40 transition-all overflow-hidden"
            >
              {/* Card header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{TYPE_EMOJI[event.type] ?? "🎊"}</span>
                    <p className="font-bold truncate">{event.title}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-semibold">
                    {isFree && <Sparkles className="h-2.5 w-2.5" />}
                    {TIER_LABEL[event.tier] ?? event.tier}
                  </span>
                  {event.eventDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(event.eventDate).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
                <div className="px-4 py-3 text-center">
                  <p className="text-lg font-black">{event._count.guests}</p>
                  <p className="text-[10px] text-muted-foreground">Invitados</p>
                </div>
                <div className="px-4 py-3 text-center">
                  {isActive && event.activeUntil ? (
                    <>
                      <p className="text-xs font-semibold truncate">
                        {new Date(event.activeUntil).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Activa hasta</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold">
                        {needsAction ? "¡Completa tus datos!" : "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {needsAction ? "Acción requerida" : "En progreso"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {needsAction ? "Llenar información" : isActive ? "Ver invitación" : "Ver estado"}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}

        {/* Add new card */}
        <Link
          href="/plantillas"
          className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center hover:border-[var(--color-champagne)]/50 hover:bg-[var(--color-champagne)]/5 transition-all min-h-[180px]"
        >
          <Plus className="h-8 w-8 text-muted-foreground/30 group-hover:text-[var(--color-champagne)] transition-colors mb-2" />
          <p className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
            Nueva invitación
          </p>
        </Link>
      </div>
    </div>
  );
}

// ── Page export ──────────────────────────────────────────────────────────────

export default async function DashboardHome() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [dbUser, subscription] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, onboardingCompleted: true, _count: { select: { events: true } } },
    }),
    prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: {
        id: true,
        plan: true,
        _count: { select: { events: { where: { paymentStatus: "PAID" } } } },
      },
    }),
  ]);

  const isAdmin      = dbUser?.role === "ADMIN";
  const isSubscriber = !isAdmin && !!subscription;
  const userName     = session.user.name?.split(" ")[0] || "Hola";

  if (isAdmin) redirect("/dashboard/admin");

  if (isSubscriber) {
    const plan      = subscription!.plan;
    const planLimit = PLAN_LIMIT[plan] ?? 5;
    const usedSlots = subscription!._count.events;

    return (
      <SubscriberHome
        userId={session.user.id}
        userName={userName}
        plan={plan}
        subscriptionId={subscription!.id}
        usedSlots={usedSlots}
        planLimit={planLimit}
      />
    );
  }

  // Cliente básico: sin suscripción, sin eventos → onboarding (solo si no lo completó)
  if (dbUser?._count.events === 0 && !dbUser?.onboardingCompleted) redirect("/dashboard/onboarding");

  return <ClientHome userId={session.user.id} userName={userName} />;
}
