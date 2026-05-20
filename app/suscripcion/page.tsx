import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSubscriptionCheckout } from "@/app/actions/billing";
import { Check, Zap, ArrowLeft, Crown } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Planes para organizadores | Momentum" };

// ─── Plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    key: "ORGANIZADOR_PLUS" as const,
    slug: "plus",
    name: "Organizador Plus",
    price: "$999",
    period: "/ mes",
    description: "Para wedding planners y equipos pequeños.",
    limit: 5,
    featured: false,
    features: [
      "Hasta 5 eventos activos simultáneos",
      "Todas las plantillas incluidas (Aurora, Confetti, Bloom, Nube)",
      "RSVP digital con confirmación",
      "Galería de fotos por evento",
      "Gestión de invitados ilimitada",
      "Generador de mensajes WhatsApp",
      "Analytics de vistas por invitado",
      "Portal Stripe para gestionar tu plan",
      "Soporte por email",
    ],
  },
  {
    key: "ORGANIZADOR_PRO" as const,
    slug: "pro",
    name: "Organizador Pro",
    price: "$1,999",
    period: "/ mes",
    description: "Para agencias con operación intensiva.",
    limit: 20,
    featured: true,
    features: [
      "Hasta 20 eventos activos simultáneos",
      "Todas las plantillas incluidas (Aurora, Confetti, Bloom, Nube)",
      "RSVP digital con confirmación",
      "Galería de fotos por evento",
      "Gestión de invitados ilimitada",
      "Generador de mensajes WhatsApp",
      "Analytics de vistas por invitado",
      "Portal Stripe para gestionar tu plan",
      "Soporte prioritario",
    ],
  },
] as const;

const PLAN_LABEL: Record<string, string> = {
  ORGANIZADOR_PLUS: "Organizador Plus",
  ORGANIZADOR_PRO: "Organizador Pro",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = { searchParams: Promise<{ plan?: string; error?: string }> };

export default async function SuscripcionPage({ searchParams }: Props) {
  const { plan: planSlug, error } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    const callbackUrl = planSlug
      ? `/suscripcion?plan=${planSlug}`
      : "/suscripcion";
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
  });

  const hasActivePlan =
    subscription &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIALING");

  async function startPlus() {
    "use server";
    const result = await createSubscriptionCheckout("ORGANIZADOR_PLUS");
    if (!result.success || !result.url) {
      redirect(
        `/suscripcion?plan=plus&error=${encodeURIComponent(result.error ?? "No se pudo iniciar checkout")}`,
      );
    }
    redirect(result.url);
  }

  async function startPro() {
    "use server";
    const result = await createSubscriptionCheckout("ORGANIZADOR_PRO");
    if (!result.success || !result.url) {
      redirect(
        `/suscripcion?plan=pro&error=${encodeURIComponent(result.error ?? "No se pudo iniciar checkout")}`,
      );
    }
    redirect(result.url);
  }

  return (
    <main className="min-h-screen bg-[var(--color-cream)] px-4 py-16">
      {/* Back */}
      <div className="mx-auto max-w-5xl mb-10">
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-midnight)]/60 hover:text-[var(--color-midnight)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-5xl text-center mb-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-midnight)]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-midnight)]/60 mb-4">
          <Zap className="h-3.5 w-3.5" />
          Para organizadores y agencias
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold text-[var(--color-midnight)] tracking-tight"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          Planes de suscripción
        </h1>
        <p className="mt-4 text-[var(--color-midnight)]/60 text-lg max-w-xl mx-auto">
          Crea y gestiona múltiples invitaciones digitales con todas las funciones incluidas.
          Cancela cuando quieras.
        </p>
      </div>

      {/* Already subscribed */}
      {hasActivePlan && subscription && (
        <div className="mx-auto max-w-2xl mb-10">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-6 text-center">
            <Crown className="mx-auto h-8 w-8 text-emerald-600 mb-3" />
            <p className="font-bold text-emerald-800 dark:text-emerald-300">
              Ya tienes el plan{" "}
              <span className="font-black">
                {PLAN_LABEL[subscription.plan] ?? subscription.plan}
              </span>{" "}
              activo
            </p>
            <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70 mt-1">
              Renueva el{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-MX", {
                day: "numeric", month: "long", year: "numeric",
              })}
              {subscription.cancelAtPeriodEnd && " (cancelación programada)"}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-5 py-2.5 text-sm font-bold text-[var(--color-cream)] hover:opacity-90 transition-opacity"
              >
                Ir a mi dashboard
              </Link>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center rounded-xl border border-[var(--color-midnight)]/20 px-5 py-2.5 text-sm font-semibold text-[var(--color-midnight)] hover:bg-[var(--color-midnight)]/5 transition-colors"
              >
                Gestionar plan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-auto max-w-2xl mb-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Plans grid */}
      {!hasActivePlan && (
        <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-2">
          {PLANS.map((plan) => {
            const isHighlighted =
              planSlug === plan.slug || (!planSlug && plan.featured);
            const action = plan.key === "ORGANIZADOR_PLUS" ? startPlus : startPro;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-all ${
                  plan.featured
                    ? "border-[var(--color-midnight)] bg-[var(--color-midnight)] text-[var(--color-cream)]"
                    : "border-border bg-white"
                } ${isHighlighted && !plan.featured ? "ring-2 ring-[var(--color-champagne)]" : ""}`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[var(--color-champagne)] px-4 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]">
                      Más popular
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className={`h-4 w-4 ${plan.featured ? "text-[var(--color-champagne)]" : "text-[var(--color-midnight)]"}`} />
                    <h2
                      className={`text-2xl font-bold ${plan.featured ? "text-[var(--color-cream)]" : "text-[var(--color-midnight)]"}`}
                      style={{ fontFamily: "var(--font-fraunces), serif" }}
                    >
                      {plan.name}
                    </h2>
                  </div>
                  <p className={`text-sm ${plan.featured ? "text-[var(--color-cream)]/60" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className={`flex items-baseline gap-1 text-5xl font-black ${plan.featured ? "text-[var(--color-cream)]" : "text-[var(--color-midnight)]"}`}>
                    {plan.price}
                    <span className={`text-lg font-medium ${plan.featured ? "text-[var(--color-cream)]/50" : "text-muted-foreground"}`}>
                      MXN {plan.period}
                    </span>
                  </div>
                  <p className={`mt-1.5 text-xs font-semibold ${plan.featured ? "text-[var(--color-champagne)]" : "text-[var(--color-midnight)]/50"}`}>
                    Hasta {plan.limit} eventos activos simultáneos
                  </p>
                </div>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-[var(--color-champagne)]" : "text-emerald-500"}`} />
                      <span className={`text-sm ${plan.featured ? "text-[var(--color-cream)]/80" : "text-foreground"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <form action={action}>
                  <button
                    type="submit"
                    className={`w-full rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-90 ${
                      plan.featured
                        ? "bg-[var(--color-champagne)] text-[var(--color-midnight)]"
                        : "bg-[var(--color-midnight)] text-[var(--color-cream)]"
                    }`}
                  >
                    Suscribirme a {plan.name.replace("Organizador ", "")}
                  </button>
                </form>

                <p className={`mt-3 text-center text-[11px] ${plan.featured ? "text-[var(--color-cream)]/40" : "text-muted-foreground"}`}>
                  Sin contrato. Cancela cuando quieras.
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      {!hasActivePlan && (
        <p className="mt-10 text-center text-xs text-[var(--color-midnight)]/40">
          Pagos procesados de forma segura por Stripe. Acepta tarjetas de crédito y débito.
        </p>
      )}
    </main>
  );
}
