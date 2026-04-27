import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { 
  Calendar, MapPin, Users, Layout, Eye, Pencil, 
  Copy, Archive, ArrowLeft, ExternalLink, Clock, Sparkles
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TIER_INFO } from "@/lib/event-sections-map";
import { sectionLabel } from "@/lib/section-labels";
import { DeleteEventDialog } from "@/components/dashboard/DeleteEventDialog";
import { createOneTimeCheckout } from "@/app/actions/billing";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      template: true,
      guests: {
        include: {
          rsvp: true,
          _count: {
            select: { invitationViews: true }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      },
      _count: {
        select: { guests: true }
      }
    }
  });

  if (!event) notFound();

  const daysToEvent = event.eventDate 
    ? differenceInDays(new Date(event.eventDate), new Date()) 
    : null;

  const stats = {
    total: event._count.guests,
    confirmed: event.guests.filter(g => g.rsvp?.status === "CONFIRMED").length,
    pending: event.guests.filter(g => !g.rsvp || g.rsvp.status === "PENDING").length,
  };

  async function startOneTimePayment() {
    "use server";
    const result = await createOneTimeCheckout(id);
    if (!result.success || !result.url) {
      redirect(`/dashboard/events/${id}`);
    }
    redirect(result.url);
  }

  const paymentBadgeClass =
    event.paymentStatus === "PAID"
      ? "bg-green-100 text-green-700"
      : event.paymentStatus === "PENDING_VOUCHER"
        ? "bg-yellow-100 text-yellow-700"
        : event.paymentStatus === "UNPAID"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";

  return (
    <div className="space-y-8 p-6 md:p-8 animate-in fade-in duration-700">
      {/* Navigation & Actions Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/events"
            className="rounded-full border border-border bg-background p-2 text-muted-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-midnight)] dark:text-[var(--color-cream)]">
                {event.title}
              </h1>
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                event.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              )}>
                {event.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono text-xs">/e/{event.slug}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {event.eventDate ? format(new Date(event.eventDate), "d 'de' MMMM", { locale: es }) : "Sin fecha"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/events/${event.id}/edit`}
            className={cn(buttonVariants({ variant: "outline" }), "gap-2 rounded-xl")}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
          <Link
            href={`/e/${event.slug}`}
            target="_blank"
            className={cn(buttonVariants({ variant: "default" }), "gap-2 rounded-xl bg-[var(--color-midnight)] text-[var(--color-cream)]")}
          >
            <Eye className="h-4 w-4" />
            Ver Invitación
          </Link>
          <div className="h-8 w-px bg-border mx-1" />
          <DeleteEventDialog 
            eventId={event.id}
            eventTitle={event.title}
            eventSlug={event.slug}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-midnight)]/60">
            Estado de pago
          </span>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", paymentBadgeClass)}>
            {event.paymentStatus}
          </span>
          {event.subscriptionId ? (
            <span className="rounded-full bg-[var(--color-brand)]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand)]">
              Cubierto por suscripción
            </span>
          ) : null}
        </div>

        {event.paymentStatus === "PAID" ? (
          <div className="grid grid-cols-1 gap-2 text-sm text-[var(--color-midnight)]/70 sm:grid-cols-2">
            <p>
              Pagado el:{" "}
              <span className="font-semibold text-[var(--color-midnight)]">
                {event.paidAt ? format(new Date(event.paidAt), "d 'de' MMM yyyy", { locale: es }) : "—"}
              </span>
            </p>
            <p>
              Activo hasta:{" "}
              <span className="font-semibold text-[var(--color-midnight)]">
                {event.activeUntil
                  ? format(new Date(event.activeUntil), "d 'de' MMM yyyy", { locale: es })
                  : "—"}
              </span>
            </p>
          </div>
        ) : null}

        {event.paymentStatus === "UNPAID" ? (
          <form action={startOneTimePayment}>
            <button
              type="submit"
              className="inline-flex rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white hover:opacity-90"
            >
              Pagar ahora
            </button>
          </form>
        ) : null}

        {event.paymentStatus === "PENDING_VOUCHER" ? (
          <p className="text-sm text-[var(--color-midnight)]/70">
            Esperando confirmación del pago en OXXO/SPEI.
          </p>
        ) : null}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Users className="h-4 w-4" /> Invitados
          </div>
          <div className="mt-2 text-3xl font-black">{stats.total}</div>
          <div className="mt-1 text-xs text-muted-foreground">Confirmados: {stats.confirmed}</div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-4 w-4" /> Cuenta Regresiva
          </div>
          <div className="mt-2 text-3xl font-black">
            {daysToEvent !== null ? `${daysToEvent} días` : "—"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Para el gran día</div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-4 w-4" /> Tier
          </div>
          <div className="mt-2 text-2xl font-black uppercase text-[var(--color-brand)]">
            {TIER_INFO[event.tier as keyof typeof TIER_INFO]?.label || event.tier}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Plan seleccionado</div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Layout className="h-4 w-4" /> Template
          </div>
          <div className="mt-2 text-2xl font-black">{event.template.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">Diseño activo</div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Detail Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Info */}
          <div className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Información General</h3>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ubicación</label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-[var(--color-brand)] mt-1 shrink-0" />
                    <span className="text-sm">{event.location || "No especificada"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cliente</label>
                  <div className="text-sm mt-1 font-medium">
                    {(event.settings as any)?.client?.name || "Sin nombre"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(event.settings as any)?.client?.email}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secciones Activas</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(event.activeSections as Record<string, boolean>).map(([key, active]) => (
                      active && (
                        <span key={key} className="rounded-full bg-muted px-2.5 py-1 text-[9px] font-bold uppercase tracking-tighter">
                          {sectionLabel(key)}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guests Preview */}
          <div className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Invitados Recientes</h3>
              <Link href={`/dashboard/events/${event.id}/guests`} className="text-sm font-bold text-[var(--color-brand)] hover:underline">
                Gestionar todos
              </Link>
            </div>
            {event.guests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-[10px] font-bold uppercase text-muted-foreground">Nombre</th>
                      <th className="pb-3 text-[10px] font-bold uppercase text-muted-foreground">Status</th>
                      <th className="pb-3 text-[10px] font-bold uppercase text-muted-foreground text-right">Vistas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {event.guests.map((guest: any) => (
                      <tr key={guest.id}>
                        <td className="py-3 text-sm font-medium">{guest.name}</td>
                        <td className="py-3">
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[8px] font-bold uppercase",
                            guest.rsvp?.status === "CONFIRMED" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"
                          )}>
                            {guest.rsvp?.status || "Pendiente"}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-right text-muted-foreground">
                          {guest._count.invitationViews}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
                <p className="text-sm text-muted-foreground">Aún no hay invitados registrados.</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Right Column */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-[var(--color-midnight)] p-8 text-[var(--color-cream)] shadow-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand)]/20 to-transparent pointer-events-none" />
            <h3 className="text-lg font-bold mb-4 relative z-10">Preview de Invitación</h3>
            <p className="text-sm text-[var(--color-cream)]/70 mb-8 relative z-10">
              Así es como los invitados ven la invitación actualmente.
            </p>
            <div className="aspect-[9/16] rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center relative z-10">
              <Link
                href={`/e/${event.slug}`}
                target="_blank"
                className="flex flex-col items-center gap-3 group/btn"
              >
                <div className="rounded-full bg-[var(--color-brand)] p-4 shadow-lg group-hover/btn:scale-110 transition-transform">
                  <ExternalLink className="h-6 w-6 text-[var(--color-midnight)]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Ver en vivo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
