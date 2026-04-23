import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, DollarSign, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardHome() {
  const session = await auth();
  const userName = session?.user?.name?.split(" ")[0] || "Admin";

  const [activeEvents, pendingRsvps, monthRevenue, totalGuests, recentEvents] =
    await Promise.all([
      prisma.event.count({ where: { status: "ACTIVE" } }),
      prisma.guest.count({ where: { rsvp: null } }),
      // Revenue del mes — por ahora retorna 0
      Promise.resolve(0),
      prisma.guest.count(),
      prisma.event.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { guests: true } } },
      }),
    ]);

  const kpis = [
    {
      label: "Eventos activos",
      value: activeEvents,
      icon: Calendar,
    },
    {
      label: "RSVPs pendientes",
      value: pendingRsvps,
      icon: Clock,
    },
    {
      label: "Revenue del mes",
      value: `$${monthRevenue} MXN`,
      icon: DollarSign,
    },
    {
      label: "Total invitados",
      value: totalGuests,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[var(--color-midnight)] tracking-tight font-serif" style={{ fontFamily: "var(--font-fraunces), serif" }}>
          Bienvenido, {userName} 👋
        </h1>
        <p className="mt-2 text-[var(--color-midnight)]/70">
          Aquí tienes un resumen de Momentum hoy
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 text-[var(--color-midnight)]/60">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{kpi.label}</span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-[var(--color-midnight)]">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Events */}
      <div className="rounded-xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-black/5 px-6 py-5">
          <h2 className="text-lg font-semibold text-[var(--color-midnight)]">
            Últimos eventos creados
          </h2>
        </div>
        
        {recentEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="h-12 w-12 text-black/20 mb-4" />
            <h3 className="text-lg font-medium text-[var(--color-midnight)]">
              No hay eventos todavía
            </h3>
            <p className="mt-1 text-sm text-[var(--color-midnight)]/60 mb-6 max-w-sm">
              Cuando los usuarios creen eventos en la plataforma, aparecerán aquí.
            </p>
            <button
              className="rounded-lg bg-[var(--color-midnight)] px-4 py-2.5 text-sm font-medium text-[var(--color-cream)] opacity-50 cursor-not-allowed"
              title="Disponible en Fase 2"
              disabled
            >
              Crear tu primer evento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--color-midnight)]/80">
              <thead className="bg-black/[0.02] text-xs uppercase text-[var(--color-midnight)]/60">
                <tr>
                  <th className="px-6 py-4 font-medium">Evento</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Invitados</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-black/[0.01]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--color-midnight)]">
                        {event.title}
                      </div>
                      <div className="text-xs text-[var(--color-midnight)]/60 mt-0.5">
                        /e/{event.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.eventDate 
                        ? new Date(event.eventDate).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Pendiente"
                      }
                    </td>
                    <td className="px-6 py-4">
                      {event._count.guests}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          event.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : event.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/e/${event.slug}`}
                        target="_blank"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Ver público
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
