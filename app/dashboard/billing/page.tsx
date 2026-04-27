import { auth } from "@/auth";
import {
  createCustomerPortalSession,
  createSubscriptionCheckout,
} from "@/app/actions/billing";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Facturación | Dashboard",
};

type SearchParams = Promise<{ error?: string }>;

function mxnFromCents(cents?: number | null) {
  if (!cents) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const STATUS_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  ACTIVE: { label: "Activa", className: "bg-green-100 text-green-700" },
  TRIALING: { label: "En prueba", className: "bg-blue-100 text-blue-700" },
  PAST_DUE: { label: "Pago atrasado", className: "bg-amber-100 text-amber-700" },
  CANCELED: { label: "Cancelada", className: "bg-slate-100 text-slate-700" },
  INCOMPLETE: { label: "Incompleta", className: "bg-amber-100 text-amber-700" },
  INCOMPLETE_EXPIRED: { label: "Expirada", className: "bg-red-100 text-red-700" },
  UNPAID: { label: "Sin pagar", className: "bg-red-100 text-red-700" },
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { error } = await searchParams;

  const [subscription, paymentLogs] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.paymentLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // ACTIVE y TRIALING cuentan como "tiene plan", el resto debe poder re-suscribirse.
  const hasActivePlan =
    subscription &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIALING");

  async function openPortal() {
    "use server";
    const result = await createCustomerPortalSession();
    if (!result.success || !result.url) {
      redirect(
        `/dashboard/billing?error=${encodeURIComponent(result.error ?? "No se pudo abrir el portal")}`,
      );
    }
    redirect(result.url);
  }

  async function startSubscriptionPlus() {
    "use server";
    const result = await createSubscriptionCheckout("ORGANIZADOR_PLUS");
    if (!result.success || !result.url) {
      redirect(
        `/dashboard/billing?error=${encodeURIComponent(result.error ?? "No se pudo iniciar checkout")}`,
      );
    }
    redirect(result.url);
  }

  async function startSubscriptionPro() {
    "use server";
    const result = await createSubscriptionCheckout("ORGANIZADOR_PRO");
    if (!result.success || !result.url) {
      redirect(
        `/dashboard/billing?error=${encodeURIComponent(result.error ?? "No se pudo iniciar checkout")}`,
      );
    }
    redirect(result.url);
  }

  const badge = subscription ? STATUS_BADGE[subscription.status] : null;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight">
          Facturación
        </h1>
        <p className="mt-1 text-[var(--color-midnight)]/70">
          Gestiona tu suscripción y métodos de cobro en Stripe
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {hasActivePlan && subscription ? (
        <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-midnight)]/50">
                Plan actual
              </p>
              <h2 className="text-2xl font-semibold text-[var(--color-midnight)]">
                {subscription.plan === "ORGANIZADOR_PLUS"
                  ? "Organizador Plus"
                  : "Organizador Pro"}
              </h2>
            </div>
            {badge ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${badge.className}`}
              >
                {badge.label}
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p className="text-sm text-[var(--color-midnight)]/70">
              Renovación:{" "}
              <span className="font-semibold text-[var(--color-midnight)]">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-MX")}
              </span>
            </p>
            <p className="text-sm text-[var(--color-midnight)]/70">
              Cancelación al final del periodo:{" "}
              <span className="font-semibold text-[var(--color-midnight)]">
                {subscription.cancelAtPeriodEnd ? "Sí" : "No"}
              </span>
            </p>
          </div>

          <form action={openPortal}>
            <button
              type="submit"
              className="inline-flex rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white hover:opacity-90"
            >
              Administrar suscripción
            </button>
          </form>
        </div>
      ) : (
        <>
          {subscription && badge ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Tu suscripción anterior está en estado{" "}
              <span className="font-bold uppercase">{badge.label}</span>. Puedes
              re-suscribirte abajo.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[var(--color-midnight)]">
                Organizador Plus
              </h2>
              <p className="mt-1 text-sm text-[var(--color-midnight)]/60">
                Para equipos pequeños
              </p>
              <p className="mt-4 text-3xl font-bold text-[var(--color-midnight)]">
                $999 MXN
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-midnight)]/70">
                <li>Hasta 5 eventos activos</li>
                <li>Cobertura por suscripción</li>
                <li>Gestión desde portal Stripe</li>
              </ul>
              <form action={startSubscriptionPlus} className="mt-6">
                <button
                  type="submit"
                  className="inline-flex rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white hover:opacity-90"
                >
                  Suscribirme
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[var(--color-midnight)]">
                Organizador Pro
              </h2>
              <p className="mt-1 text-sm text-[var(--color-midnight)]/60">
                Para operación intensiva
              </p>
              <p className="mt-4 text-3xl font-bold text-[var(--color-midnight)]">
                $1,999 MXN
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-midnight)]/70">
                <li>Hasta 20 eventos activos</li>
                <li>Cobertura por suscripción</li>
                <li>Gestión desde portal Stripe</li>
              </ul>
              <form action={startSubscriptionPro} className="mt-6">
                <button
                  type="submit"
                  className="inline-flex rounded-lg bg-[var(--color-midnight)] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white hover:opacity-90"
                >
                  Suscribirme
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      <div className="rounded-xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-black/5 px-6 py-5">
          <h2 className="text-lg font-semibold text-[var(--color-midnight)]">
            Historial de pagos
          </h2>
          <p className="text-xs text-[var(--color-midnight)]/60">
            Últimos 10 movimientos registrados desde Stripe
          </p>
        </div>
        {paymentLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-midnight)]/60">
            Aún no hay pagos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--color-midnight)]/80">
              <thead className="bg-black/[0.02] text-xs uppercase text-[var(--color-midnight)]/60">
                <tr>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Evento Stripe</th>
                  <th className="px-6 py-4 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {paymentLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4">
                      {new Date(log.createdAt).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{log.type}</td>
                    <td className="px-6 py-4">{mxnFromCents(log.amount)}</td>
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
