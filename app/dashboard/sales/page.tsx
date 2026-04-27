import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, Calendar, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Ventas | Dashboard",
};

function mxnFromCents(cents?: number | null) {
  if (!cents) return "$0 MXN";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function monthWindow(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

export default async function SalesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const now = new Date();
  const thisMonth = monthWindow(now);
  const prevMonth = monthWindow(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const [subscription, logs, paidEventsThisMonth, paidEventsPrevMonth] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true, status: true },
    }),
    prisma.paymentLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.event.count({
      where: {
        userId: session.user.id,
        paymentStatus: "PAID",
        paidAt: { gte: thisMonth.start, lt: thisMonth.end },
      },
    }),
    prisma.event.count({
      where: {
        userId: session.user.id,
        paymentStatus: "PAID",
        paidAt: { gte: prevMonth.start, lt: prevMonth.end },
      },
    }),
  ]);

  // Solo contamos pagos exitosos. Excluimos failed/expired/refunded para que la
  // métrica "Total recaudado" no se infle por intentos que nunca cobramos.
  const isSuccessfulPayment = (logType: string) =>
    logType === "checkout.session.completed" ||
    logType === "checkout.session.async_payment_succeeded" ||
    logType === "invoice.payment_succeeded";

  const totalCollected = logs.reduce(
    (sum, log) => (isSuccessfulPayment(log.type) ? sum + (log.amount ?? 0) : sum),
    0,
  );
  const soldEvents = logs.filter((log) => {
    if (!isSuccessfulPayment(log.type)) return false;
    const payload = log.rawPayload as Record<string, unknown> | null;
    const mode = payload?.mode;
    return mode === "payment";
  }).length;
  const mrrByPlan = {
    ORGANIZADOR_PLUS: 99900,
    ORGANIZADOR_PRO: 199900,
  } as const;
  const subscriptionMrr =
    subscription?.status === "ACTIVE" ? mrrByPlan[subscription.plan] ?? 0 : 0;

  const eventIds = Array.from(new Set(logs.map((log) => log.eventId).filter(Boolean))) as string[];
  const events =
    eventIds.length > 0
      ? await prisma.event.findMany({
          where: { id: { in: eventIds } },
          select: { id: true, title: true },
        })
      : [];
  const eventsMap = new Map(events.map((event) => [event.id, event]));

  const typeLabel = (log: (typeof logs)[number]) => {
    const payload = log.rawPayload as Record<string, unknown> | null;
    const metadata = payload?.metadata as Record<string, unknown> | undefined;
    if (metadata?.type === "subscription") return "subscription";
    if (metadata?.type === "one-time") return "one-time";
    if (payload?.mode === "subscription") return "subscription";
    return "one-time";
  };

  const statusLabel = (log: (typeof logs)[number]) => {
    if (log.type.includes("failed")) return "Fallido";
    if (log.type.includes("async_payment")) return "Pendiente";
    if (log.type.includes("completed")) return "Completado";
    return "Registrado";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight">Ventas</h1>
        <p className="mt-1 text-[var(--color-midnight)]/70">
          Resumen de cobros y actividad de Stripe
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-[var(--color-midnight)]/60">
            <CreditCard className="h-5 w-5" />
            <span className="text-sm font-medium">Total recaudado</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-[var(--color-midnight)]">
            {mxnFromCents(totalCollected)}
          </p>
        </div>

        <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-[var(--color-midnight)]/60">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Eventos vendidos</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-[var(--color-midnight)]">{soldEvents}</p>
          <p className="mt-1 text-xs text-[var(--color-midnight)]/60">
            Mes actual: {paidEventsThisMonth} · Mes anterior: {paidEventsPrevMonth}
          </p>
        </div>

        <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm sm:col-span-2">
          <div className="flex items-center gap-3 text-[var(--color-midnight)]/60">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">Subscription MRR</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-[var(--color-midnight)]">
            {mxnFromCents(subscriptionMrr)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-midnight)]/60">
            {subscription
              ? `Plan ${subscription.plan} · Estado ${subscription.status}`
              : "Sin suscripción activa"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-black/5 px-6 py-5">
          <h2 className="text-lg font-semibold text-[var(--color-midnight)]">Últimas transacciones</h2>
        </div>
        {logs.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
            <p className="text-lg font-medium text-[var(--color-midnight)]">Aún no hay ventas</p>
            <p className="mt-1 text-sm text-[var(--color-midnight)]/60">
              Cuando recibas pagos por Stripe, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--color-midnight)]/80">
              <thead className="bg-black/[0.02] text-xs uppercase text-[var(--color-midnight)]/60">
                <tr>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium">Monto</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {logs.map((log) => {
                  const linkedEvent = log.eventId ? eventsMap.get(log.eventId) : null;
                  return (
                    <tr key={log.id}>
                      <td className="px-6 py-4">
                        {new Date(log.createdAt).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 uppercase text-xs font-bold">{typeLabel(log)}</td>
                      <td className="px-6 py-4">{mxnFromCents(log.amount)}</td>
                      <td className="px-6 py-4">{statusLabel(log)}</td>
                      <td className="px-6 py-4">
                        {linkedEvent ? (
                          <Link
                            href={`/dashboard/events/${linkedEvent.id}`}
                            className="font-medium text-[var(--color-brand)] hover:underline"
                          >
                            {linkedEvent.title}
                          </Link>
                        ) : (
                          <span className="text-[var(--color-midnight)]/50">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
