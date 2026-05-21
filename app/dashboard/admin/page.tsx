import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { RoleToggleButton } from "./RoleToggleButton";

export const metadata = {
  title: "Super Admin | Momentum",
};

/* ─── Helpers ───────────────────────────────────────────── */

function formatMXN(cents: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(cents / 100);
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "badge-status-success",
    DRAFT: "badge-status-warning",
    PAID: "badge-status-info",
    ARCHIVED: "badge-status-neutral",
    COMPLETED: "badge-status-neutral",
    BUILDING: "badge-status-info",
    REVIEW: "badge-status-warning",
  };
  return map[status] ?? "badge-status-neutral";
}

function paymentBadge(status: string) {
  const map: Record<string, string> = {
    PAID: "badge-status-success",
    UNPAID: "badge-status-danger",
    PENDING_VOUCHER: "badge-status-warning",
    EXPIRED: "badge-status-danger",
    REFUNDED: "badge-status-neutral",
  };
  return map[status] ?? "badge-status-neutral";
}

/* ─── Page ──────────────────────────────────────────────── */

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (currentUser?.role !== "ADMIN") redirect("/dashboard");

  /* ── Queries ──────────────────────────────────────────── */

  const [
    totalUsers,
    activeEvents,
    draftEvents,
    archivedEvents,
    totalRecaudado,
    mrrSubscriptions,
    recentUsers,
    recentEvents,
    recentLogs,
  ] = await Promise.all([
    // Métricas
    prisma.user.count(),
    prisma.event.count({ where: { status: "ACTIVE" } }),
    prisma.event.count({ where: { status: "DRAFT" } }),
    prisma.event.count({ where: { status: "ARCHIVED" } }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amountCents: true },
    }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),

    // Tablas
    prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { events: true } } },
    }),
    prisma.event.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.paymentLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const kpis = [
    {
      label: "Usuarios registrados",
      value: totalUsers,
      icon: Users,
    },
    {
      label: "Eventos activos / borrador / archivados",
      value: `${activeEvents} / ${draftEvents} / ${archivedEvents}`,
      icon: Calendar,
    },
    {
      label: "Suscripciones activas (MRR)",
      value: mrrSubscriptions,
      icon: TrendingUp,
    },
    {
      label: "Total recaudado",
      value: formatMXN(totalRecaudado._sum.amountCents ?? 0),
      icon: DollarSign,
    },
  ];

  /* ── Render ───────────────────────────────────────────── */

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-[var(--color-brand)]" />
          <h1
            className="text-3xl font-bold tracking-tight font-serif md:text-4xl"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Panel de Super Admin
          </h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Vista global de la plataforma Momentum.
        </p>
      </div>

      {/* ── SECCIÓN 1: KPIs ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm"
            >
              <div className="flex items-center gap-3 text-muted-foreground">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{kpi.label}</span>
              </div>
              <p className="mt-4 text-3xl font-semibold">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── SECCIÓN 2: Usuarios recientes ───────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold">Usuarios recientes</h2>
          <span className="text-xs text-muted-foreground">Últimos 20</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium text-center">Role</th>
                <th className="px-6 py-4 font-medium text-center">Eventos</th>
                <th className="px-6 py-4 font-medium">Registro</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <div className="font-medium">{u.email}</div>
                    {u.name && (
                      <div className="text-xs text-muted-foreground">
                        {u.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        u.role === "ADMIN"
                          ? "badge-status-danger"
                          : "badge-status-info"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u._count.events}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <RoleToggleButton
                      userId={u.id}
                      currentRole={u.role}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="divide-y divide-border md:hidden">
          {recentUsers.map((u) => (
            <div key={u.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-sm">{u.email}</p>
                  {u.name && (
                    <p className="text-xs text-muted-foreground">{u.name}</p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                    u.role === "ADMIN"
                      ? "badge-status-danger"
                      : "badge-status-info"
                  }`}
                >
                  {u.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {u.plan} · {u._count.events} eventos ·{" "}
                  {new Date(u.createdAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <RoleToggleButton userId={u.id} currentRole={u.role} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECCIÓN 3: Eventos recientes ────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold">Eventos recientes</h2>
          <span className="text-xs text-muted-foreground">Últimos 20</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Título</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-center">Pago</th>
                <th className="px-6 py-4 font-medium">Usuario</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <div className="font-medium">{ev.title}</div>
                    <div className="text-xs text-muted-foreground">
                      /e/{ev.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs uppercase">{ev.type}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadge(ev.status)}`}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {ev.tier === "FREE" ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        No aplica
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${paymentBadge(ev.paymentStatus)}`}
                      >
                        {ev.paymentStatus}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {ev.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs">
                    {new Date(ev.createdAt).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="divide-y divide-border md:hidden">
          {recentEvents.map((ev) => (
            <div key={ev.id} className="flex flex-col gap-1.5 p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-sm">{ev.title}</h3>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${statusBadge(ev.status)}`}
                >
                  {ev.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{ev.type}</span>
                <span>·</span>
                {ev.tier === "FREE" ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 text-[9px] font-bold uppercase">
                    No aplica
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${paymentBadge(ev.paymentStatus)}`}
                  >
                    {ev.paymentStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {ev.user.email} ·{" "}
                {new Date(ev.createdAt).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECCIÓN 4: Pagos recientes (PaymentLog) ─────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Pagos recientes (Stripe logs)
          </h2>
          <span className="text-xs text-muted-foreground">Últimos 10</span>
        </div>

        {recentLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <CreditCard className="mb-4 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No hay registros de pago todavía.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Tipo</th>
                    <th className="px-6 py-4 font-medium">Monto</th>
                    <th className="px-6 py-4 font-medium">Evento / Usuario</th>
                    <th className="px-6 py-4 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <span className="rounded bg-muted px-2 py-1 text-xs font-mono">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {log.amount != null
                          ? formatMXN(log.amount)
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {log.eventId && (
                          <span>Evento: {log.eventId.slice(0, 8)}…</span>
                        )}
                        {log.userId && (
                          <span className="ml-2">
                            User: {log.userId.slice(0, 8)}…
                          </span>
                        )}
                        {!log.eventId && !log.userId && "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {new Date(log.createdAt).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-border md:hidden">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex flex-col gap-1 p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                      {log.type}
                    </span>
                    <span className="text-sm font-semibold">
                      {log.amount != null ? formatMXN(log.amount) : "—"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
