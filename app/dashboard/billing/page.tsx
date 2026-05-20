import { auth } from "@/auth";
import {
  cancelSubscription,
  forceCancelSubscription,
  createCustomerPortalSession,
  createSubscriptionCheckout,
} from "@/app/actions/billing";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Facturación | Dashboard",
};

type SearchParams = Promise<{ error?: string; cancelled?: string; forcecancelled?: string }>;

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
  ACTIVE: { label: "Activa", className: "badge-status-success" },
  TRIALING: { label: "En prueba", className: "badge-status-info" },
  PAST_DUE: { label: "Pago atrasado", className: "badge-status-warning" },
  CANCELED: { label: "Cancelada", className: "badge-status-neutral" },
  INCOMPLETE: { label: "Incompleta", className: "badge-status-warning" },
  INCOMPLETE_EXPIRED: { label: "Expirada", className: "badge-status-danger" },
  UNPAID: { label: "Sin pagar", className: "badge-status-danger" },
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

  const { error, cancelled, forcecancelled } = await searchParams;

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

  async function handleCancelSubscription() {
    "use server";
    const result = await cancelSubscription();
    if (!result.success) {
      redirect(
        `/dashboard/billing?error=${encodeURIComponent(result.error ?? "No se pudo cancelar la suscripción")}`,
      );
    }
    redirect("/dashboard/billing?cancelled=1");
  }

  async function handleForceCancelSubscription() {
    "use server";
    const result = await forceCancelSubscription();
    if (!result.success) {
      redirect(
        `/dashboard/billing?error=${encodeURIComponent(result.error ?? "No se pudo cancelar la suscripción")}`,
      );
    }
    redirect("/dashboard/billing?forcecancelled=1");
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
        <h1 className="text-3xl font-bold tracking-tight">
          Facturación
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona tu suscripción y métodos de cobro en Stripe
        </p>
      </div>

      {error ? (
        <div className="badge-status-danger rounded-xl border border-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {cancelled ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          Tu suscripción se cancelará al final del periodo actual. Seguirás teniendo acceso hasta entonces.
        </div>
      ) : null}

      {forcecancelled ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          Tu suscripción fue cancelada inmediatamente. Ya no tienes acceso al plan.
        </div>
      ) : null}

      {hasActivePlan && subscription ? (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Plan actual
              </p>
              <h2 className="text-2xl font-semibold">
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
            <p className="text-sm text-muted-foreground">
              Renovación:{" "}
              <span className="font-semibold text-foreground">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-MX")}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Cancelación al final del periodo:{" "}
              <span className="font-semibold text-foreground">
                {subscription.cancelAtPeriodEnd ? "Sí" : "No"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <form action={openPortal}>
              <button
                type="submit"
                className="inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
              >
                Administrar suscripción
              </button>
            </form>

            {!subscription.cancelAtPeriodEnd && (
              <form action={handleCancelSubscription}>
                <button
                  type="submit"
                  className="inline-flex rounded-lg border border-border px-5 py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground transition-all hover:border-destructive hover:text-destructive"
                >
                  Cancelar al final del periodo
                </button>
              </form>
            )}

            {subscription.cancelAtPeriodEnd && (
              <form action={handleForceCancelSubscription}>
                <button
                  type="submit"
                  className="inline-flex rounded-lg border border-destructive px-5 py-3 text-sm font-bold uppercase tracking-wider text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground"
                >
                  Cancelar ahora
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <>
          {subscription && badge ? (
            <div className="badge-status-warning rounded-xl border border-amber-200 p-4 text-sm">
              Tu suscripción anterior está en estado{" "}
              <span className="font-bold uppercase">{badge.label}</span>. Puedes
              re-suscribirte abajo.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
              <h2 className="text-xl font-semibold">
                Organizador Plus
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Para equipos pequeños
              </p>
              <p className="mt-4 text-3xl font-bold">
                $999 MXN
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Hasta 5 eventos activos</li>
                <li>Cobertura por suscripción</li>
                <li>Gestión desde portal Stripe</li>
              </ul>
              <form action={startSubscriptionPlus} className="mt-6">
                <button
                  type="submit"
                  className="inline-flex rounded-lg bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wider text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Suscribirme
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
              <h2 className="text-xl font-semibold">
                Organizador Pro
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Para operación intensiva
              </p>
              <p className="mt-4 text-3xl font-bold">
                $1,999 MXN
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Hasta 20 eventos activos</li>
                <li>Cobertura por suscripción</li>
                <li>Gestión desde portal Stripe</li>
              </ul>
              <form action={startSubscriptionPro} className="mt-6">
                <button
                  type="submit"
                  className="inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Suscribirme
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold">
            Historial de pagos
          </h2>
          <p className="text-xs text-muted-foreground">
            Últimos 10 movimientos registrados desde Stripe
          </p>
        </div>
        {paymentLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Aún no hay pagos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Evento Stripe</th>
                  <th className="px-6 py-4 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
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
