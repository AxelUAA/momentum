import Link from "next/link";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { fulfillPublicCheckout } from "@/app/actions/checkout";

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

function getVoucherReference(paymentIntent: Stripe.PaymentIntent | null): string | null {
  if (!paymentIntent || !paymentIntent.next_action) return null;

  if (paymentIntent.next_action.type === "oxxo_display_details") {
    return paymentIntent.next_action.oxxo_display_details?.number ?? null;
  }

  if (paymentIntent.next_action.type === "display_bank_transfer_instructions") {
    const instructions = paymentIntent.next_action.display_bank_transfer_instructions;
    if (!instructions) return null;
    const transferData = instructions.financial_addresses?.[0];
    if (transferData?.type === "spei") {
      return transferData.spei?.clabe ?? null;
    }
  }

  return null;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) redirect("/");

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
  } catch {
    redirect("/");
  }

  const isPublicCheckout = session.metadata?.type === "public-checkout";
  const clientEmail = session.metadata?.clientEmail ?? session.customer_details?.email ?? null;

  // ── CHECKOUT PÚBLICO: pago con tarjeta confirmado ─────────────────────────
  if (isPublicCheckout && session.payment_status === "paid") {
    const result = await fulfillPublicCheckout(sessionId);

    if (result.eventId) {
      redirect(`/dashboard/mi-invitacion/${result.eventId}`);
    }

    // fulfillPublicCheckout falló — mostrar confirmación genérica
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-[var(--color-cream)]">
        <div className="w-full max-w-lg rounded-2xl border border-black/5 bg-white p-8 shadow-sm text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1
            className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight mb-3"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            ¡Pago confirmado!
          </h1>
          <p className="text-[var(--color-midnight)]/70 mb-6">
            Tu invitación aparecerá en tu dashboard en unos minutos. Si no aparece,
            revisa tu email{" "}
            {clientEmail && (
              <strong className="text-[var(--color-midnight)]">{clientEmail}</strong>
            )}{" "}
            o escríbenos.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[var(--color-cream)] hover:opacity-90 transition-opacity"
          >
            Ir a mi dashboard
          </Link>
        </div>
      </main>
    );
  }

  // ── CHECKOUT PÚBLICO: OXXO/SPEI pendiente ──────────────────────────────
  if (isPublicCheckout && session.payment_status === "unpaid") {
    const paymentIntent =
      typeof session.payment_intent === "string" ? null : session.payment_intent;
    const reference = getVoucherReference(paymentIntent);

    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-[var(--color-cream)]">
        <div className="w-full max-w-lg rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
          <div className="text-4xl mb-4">🧾</div>
          <h1
            className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight mb-3"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Pago pendiente
          </h1>
          <p className="text-[var(--color-midnight)]/70 mb-6">
            Tu ficha de pago fue generada. Una vez confirmado el pago, tu invitación
            aparecerá automáticamente en tu dashboard.
          </p>
          {reference && (
            <div className="mb-6 rounded-xl bg-black/[0.03] p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--color-midnight)]/50 mb-1">
                Referencia de pago
              </p>
              <p className="break-all text-lg font-semibold text-[var(--color-midnight)]">
                {reference}
              </p>
            </div>
          )}
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-6">
            El pago en OXXO puede tardar hasta 24 horas en reflejarse.
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[var(--color-cream)] hover:opacity-90 transition-opacity"
          >
            Ir a mi dashboard
          </Link>
        </div>
      </main>
    );
  }

  // ── SUSCRIPCIÓN ──────────────────────────────────────────────────────────
  if (session.mode === "subscription" && session.payment_status === "paid") {
    const dbUserId   = session.metadata?.userId;
    const metaPlan   = session.metadata?.plan;
    const validPlans = ["ORGANIZADOR_PLUS", "ORGANIZADOR_PRO"] as const;
    const plan       = validPlans.includes(metaPlan as any) ? (metaPlan as typeof validPlans[number]) : null;

    const PLAN_LABEL: Record<string, string> = {
      ORGANIZADOR_PLUS: "Organizador Plus",
      ORGANIZADOR_PRO:  "Organizador Pro",
    };
    const PLAN_PERKS: Record<string, string[]> = {
      ORGANIZADOR_PLUS: ["Hasta 5 eventos activos", "Editor completo de invitaciones", "Gestión de invitados ilimitada"],
      ORGANIZADOR_PRO:  ["Hasta 20 eventos activos", "Editor completo de invitaciones", "Gestión de invitados ilimitada", "Prioridad en soporte"],
    };

    if (dbUserId && plan && session.subscription && session.customer) {
      const stripeSubscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription as any).id;
      const stripeCustomerId =
        typeof session.customer === "string"
          ? session.customer
          : (session.customer as any).id;

      try {
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const items     = stripeSub.items?.data ?? [];
        const periodEnd = items[0]
          ? new Date((items[0] as any).current_period_end * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await prisma.subscription.upsert({
          where: { userId: dbUserId },
          update: {
            stripeCustomerId,
            stripeSubscriptionId,
            plan,
            status: "ACTIVE",
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
          },
          create: {
            userId: dbUserId,
            stripeCustomerId,
            stripeSubscriptionId,
            plan,
            status: "ACTIVE",
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
          },
        });

        await prisma.user.update({
          where: { id: dbUserId },
          data: { stripeCustomerId },
        });
      } catch (err) {
        console.error("[checkout/success] subscription upsert failed:", err);
      }
    }

    const planLabel = plan ? (PLAN_LABEL[plan] ?? plan) : "tu plan";
    const perks     = plan ? (PLAN_PERKS[plan] ?? []) : [];

    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-[var(--color-cream)]">
        <div className="w-full max-w-lg rounded-2xl border border-black/5 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand)]/10">
            <svg className="h-8 w-8 text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>

          <h1
            className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight mb-2"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            ¡Bienvenido, organizador!
          </h1>
          <p className="text-[var(--color-midnight)]/60 mb-6">
            Tu suscripción{" "}
            <strong className="text-[var(--color-midnight)]">{planLabel}</strong>{" "}
            está activa. Ya puedes crear y publicar tus invitaciones.
          </p>

          {perks.length > 0 && (
            <ul className="mb-8 space-y-2 text-left">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-[var(--color-midnight)]/80">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[var(--color-cream)] hover:opacity-90 transition-opacity"
          >
            Ir a mi dashboard
          </Link>
        </div>
      </main>
    );
  }

  // ── FLUJO ADMIN: pago de evento creado desde el dashboard ──────────────
  if (session.payment_status === "paid") {
    redirect("/dashboard");
  }

  // ── FLUJO ADMIN: OXXO pendiente ─────────────────────────────────────────
  if (session.payment_status === "unpaid") {
    const paymentIntent =
      typeof session.payment_intent === "string" ? null : session.payment_intent;
    const reference = getVoucherReference(paymentIntent);

    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
          <h1
            className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Pago pendiente
          </h1>
          <p className="mt-3 text-[var(--color-midnight)]/70">
            Tu ficha fue generada. El pago puede tardar hasta 24 horas.
          </p>
          <div className="mt-6 rounded-xl bg-black/[0.03] p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--color-midnight)]/50">
              Referencia de pago
            </p>
            <p className="mt-2 break-all text-lg font-semibold text-[var(--color-midnight)]">
              {reference ?? "Consulta los detalles en tu email de Stripe"}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-lg border border-black/10 px-5 py-3 text-sm font-bold uppercase tracking-wider text-[var(--color-midnight)] hover:bg-black/[0.02]"
          >
            Volver al dashboard
          </Link>
        </div>
      </main>
    );
  }

  redirect("/");
}
