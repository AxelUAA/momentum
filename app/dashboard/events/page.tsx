import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Plus, Search, Eye, Pencil, Copy, Archive, Filter } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TIER_INFO } from "@/lib/event-sections-map";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const session = await auth();
  
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { guests: true }
      }
    }
  });

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-midnight)] dark:text-[var(--color-cream)]">
            Eventos
          </h1>
          <p className="text-muted-foreground">
            Gestiona y crea las invitaciones para tus clientes.
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className={cn(buttonVariants(), "gap-2 shimmer border-none text-[var(--color-midnight)]")}
        >
          <Plus className="h-4 w-4" />
          Crear nuevo evento
        </Link>
      </div>

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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background/50 backdrop-blur-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Evento</th>
                <th className="px-6 py-4 text-center">Tipo</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-center">Tier</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Invitados</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
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
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{event.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">/e/{event.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-[var(--color-brand)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand)]">
                        {event.eventType}
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
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        event.tier === "LUXURY" ? "bg-amber-100 text-amber-700" :
                        event.tier === "COMPLETE" ? "bg-[var(--color-brand)]/20 text-[var(--color-brand)]" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {TIER_INFO[event.tier as keyof typeof TIER_INFO]?.label || event.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        event.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                        event.status === "DRAFT" ? "bg-yellow-100 text-yellow-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground font-medium">
                      {event._count.guests}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/dashboard/events/${event.id}`}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-[var(--color-brand)] transition-colors shadow-sm ring-1 ring-border/50"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/events/${event.id}/edit`}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-[var(--color-brand)] transition-colors shadow-sm ring-1 ring-border/50"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-[var(--color-brand)] transition-colors shadow-sm ring-1 ring-border/50"
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-destructive transition-colors shadow-sm ring-1 ring-border/50"
                          title="Archivar"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
