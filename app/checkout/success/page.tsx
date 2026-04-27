import Link from "next/link";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

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

  if (!sessionId) {
    redirect("/dashboard");
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (!session) {
      redirect("/dashboard");
    }

    if (session.payment_status === "paid") {
      return (
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <h1
              className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight font-serif"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Pago confirmado
            </h1>
            <p className="mt-3 text-[var(--color-midnight)]/70">
              Tu pago fue procesado con éxito. Ya puedes continuar desde tu dashboard.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white hover:opacity-90"
            >
              Ir al dashboard
            </Link>
          </div>
        </main>
      );
    }

    if (session.payment_status === "unpaid") {
      const paymentIntent =
        typeof session.payment_intent === "string" ? null : session.payment_intent;
      const reference = getVoucherReference(paymentIntent);

      return (
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <h1
              className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight font-serif"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Pago pendiente
            </h1>
            <p className="mt-3 text-[var(--color-midnight)]/70">
              Tu ficha de pago fue generada. El pago por OXXO o SPEI puede tardar hasta 24 horas
              en reflejarse.
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
  } catch {
    redirect("/dashboard");
  }

  redirect("/dashboard");
}
