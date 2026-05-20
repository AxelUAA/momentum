import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Plus, Search, Eye, Pencil, Copy, Archive, Filter, AlertTriangle, Zap } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TIER_INFO } from "@/lib/event-sections-map";
import { EventActions } from "@/components/dashboard/events/EventActions";

export const dynamic = "force-dynamic";

const PLAN_LIMIT: Record<string, number> = {
  ORGANIZADOR_PLUS: 5,
  ORGANIZADOR_PRO: 20,
};

const PAYMENT_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  PAID: { label: "Pagado", className: "badge-status-success" },
  PENDING_VOUCHER: { label: "Procesando", className: "badge-status-warning" },
  UNPAID: { label: "Sin pagar", className: "badge-status-danger" },
  EXPIRED: { label: "Expirado", className: "badge-status-danger" },
  REFUNDED: { label: "Reembolsado", className: "badge-status-neutral" },
};

export default async function EventsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const isAdmin = session.user.role === "ADMIN";
  const where = isAdmin ? {} : { userId: session.user.id };

  const [events, subscription] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { guests: true } } },
    }),
    isAdmin
      ? Promise.resolve(null)
      : prisma.subscription.findFirst({
          where: { userId: session.user.id, status: "ACTIVE" },
          select: {
            id: true,
            plan: true,
            _count: { select: { events: { where: { paymentStatus: "PAID" } } } },
          },
        }),
  ]);

  const isSubscriber = !isAdmin && !!subscription;
  const planLimit    = isSubscriber ? (PLAN_LIMIT[subscription!.plan] ?? 5) : null;
  const usedSlots    = isSubscriber ? subscription!._count.events : null;
  const slotsLeft    = planLimit !== null && usedSlots !== null ? planLimit - usedSlots : null;
  const atLimit      = slotsLeft !== null && slotsLeft <= 0;

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-midnight)] dark:text-[var(--color-cream)]">
            Eventos
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Gestiona y crea las invitaciones para tus clientes." : "Tus eventos e invitaciones activas."}
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
            className={cn(buttonVariants(), "gap-2 shimmer border-none text-[var(--color-midnight)]")}
          >
            <Plus className="h-4 w-4" />
            Crear nuevo evento
          </Link>
        )}
      </div>

      {/* Plan usage banner — subscribers only */}
      {isSubscriber && planLimit !== null && usedSlots !== null && (
        <div className={cn(
          "flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between",
          atLimit
            ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
            : "border-border bg-card"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              atLimit ? "bg-red-100 dark:bg-red-900/40" : "bg-[var(--color-brand)]/10"
            )}>
              {atLimit
                ? <AlertTriangle className="h-4 w-4 text-red-500" />
                : <Zap className="h-4 w-4 text-[var(--color-brand)]" />
              }
            </div>
            <div>
              <p className={cn("text-sm font-bold", atLimit ? "text-red-600 dark:text-red-400" : "text-foreground")}>
                {usedSlots} de {planLimit} eventos usados en tu plan
              </p>
              <p className="text-xs text-muted-foreground">
                {atLimit
                  ? "Actualiza tu plan para crear más eventos."
                  : `Te quedan ${slotsLeft} evento${slotsLeft !== 1 ? "s" : ""} disponibles.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  atLimit ? "bg-red-500" : "bg-[var(--color-brand)]"
                )}
                style={{ width: `${Math.min(100, Math.round((usedSlots / planLimit) * 100))}%` }}
              />
            </div>
            {atLimit && (
              <Link href="/dashboard/billing" className="text-xs font-bold text-[var(--color-brand)] underline whitespace-nowrap">
                Actualizar plan
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Filters (Simplified for now) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título o slug..."
            className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium hover:bg-muted/50 transition-colors">
            <Filter className="h-4 w-4" />
            Filtros
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background/50 backdrop-blur-xl shadow-sm">
        {events.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted p-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No hay eventos aún</h3>
              <p className="text-sm text-muted-foreground">Crea tu primer evento para empezar.</p>
              <Link href="/dashboard/events/new" className={cn(buttonVariants({ variant: "outline" }), "mt-2")}>
                Empezar ahora
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Evento</th>
                    <th className="px-6 py-4 text-center">Tipo</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4 text-center">Tier</th>
                    <th className="px-6 py-4 text-center">Pago</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Invitados</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {events.map((event) => (
                    <tr key={event.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{event.title}</div>
                        <div className="text-xs text-muted-foreground font-mono">/e/{event.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-[var(--color-brand)]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand)]">
                          {event.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {event.eventDate 
                          ? format(new Date(event.eventDate), "d 'de' MMM, yyyy", { locale: es })
                          : "Sin fecha"
                        }
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          event.tier === "LUXURY" ? "badge-status-warning" :
                          event.tier === "COMPLETE" ? "bg-[var(--color-brand)]/20 text-[var(--color-brand)]" :
                          "badge-status-neutral"
                        )}>
                          {TIER_INFO[event.tier as keyof typeof TIER_INFO]?.label || event.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(() => {
                          const badge = PAYMENT_BADGE[event.paymentStatus] ?? PAYMENT_BADGE.UNPAID;
                          return (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                badge.className,
                              )}
                            >
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          event.status === "ACTIVE" ? "badge-status-success" :
                          event.status === "DRAFT" ? "badge-status-warning" :
                          "badge-status-neutral"
                        )}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground font-bold">
                        {event._count.guests}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <EventActions
                          eventId={event.id}
                          eventTitle={event.title}
                          eventSlug={event.slug}
                          paymentStatus={event.paymentStatus}
                          isSubscriber={isSubscriber}
                          eventStatus={event.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-border/50">
              {events.map((event) => (
                <div key={event.id} className="p-4 space-y-4 bg-background/30">
                  <div className="flex items-start justify-between">
                    <div>
                       <Link href={`/dashboard/events/${event.id}`} className="font-bold text-lg hover:text-[var(--color-brand)] transition-colors">
                          {event.title}
                       </Link>
                       <div className="text-xs text-muted-foreground font-mono mt-0.5">/e/{event.slug}</div>
                    </div>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                      event.status === "ACTIVE" ? "badge-status-success" : "badge-status-warning"
                    )}>
                      {event.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-border bg-background/50 p-3">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Fecha</p>
                       <p className="font-medium">
                          {event.eventDate ? format(new Date(event.eventDate), "d 'de' MMM") : "—"}
                       </p>
                    </div>
                    <div className="rounded-xl border border-border bg-background/50 p-3 text-center">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Invitados</p>
                       <p className="font-black text-foreground">{event._count.guests}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                     <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand)] bg-[var(--color-brand)]/10 px-2 py-1 rounded-md">
                          {event.type}
                       </span>
                       {(() => {
                         const badge = PAYMENT_BADGE[event.paymentStatus] ?? PAYMENT_BADGE.UNPAID;
                         return (
                           <span
                             className={cn(
                               "inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                               badge.className,
                             )}
                           >
                             {badge.label}
                           </span>
                         );
                       })()}
                     </div>
                     <EventActions
                        eventId={event.id}
                        eventTitle={event.title}
                        eventSlug={event.slug}
                        paymentStatus={event.paymentStatus}
                        isSubscriber={isSubscriber}
                        eventStatus={event.status}
                      />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
