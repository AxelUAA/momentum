"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { STRIPE_PRICES, stripe } from "@/lib/stripe";

type BillingActionResult = {
  success: boolean;
  url?: string;
  error?: string;
};

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

/**
 * Garantiza que el usuario tenga un Customer en Stripe.
 * Necesario para SPEI/customer_balance, que NO acepta `customer_email` ni
 * `customer_creation: "always"` — exige `customer:` ya creado.
 */
async function ensureStripeCustomer(userId: string): Promise<string> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });
  if (!dbUser) throw new Error("Usuario no encontrado");
  if (dbUser.stripeCustomerId) return dbUser.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: dbUser.email ?? undefined,
    name: dbUser.name ?? undefined,
    metadata: { userId: dbUser.id },
  });

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createOneTimeCheckout(eventId: string): Promise<BillingActionResult> {
  try {
    const user = await requireUser();

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, tier: true, userId: true, paymentStatus: true },
    });

    if (!event) {
      return { success: false, error: "Evento no encontrado" };
    }

    // Ownership: solo el dueño (o un admin) puede pagar el evento.
    if (event.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "No tienes acceso a este evento" };
    }

    if (event.paymentStatus === "PAID") {
      return { success: false, error: "Este evento ya fue pagado" };
    }

    const priceId =
      event.tier === "LUXURY"
        ? STRIPE_PRICES.invitacionPremium
        : STRIPE_PRICES.invitacionPro;

    if (!priceId) {
      return { success: false, error: "Price ID de Stripe no configurado" };
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_BASE_URL no está configurada" };
    }

    // SPEI exige `customer:` (no acepta customer_email ni customer_creation).
    const stripeCustomerId = await ensureStripeCustomer(user.id);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "oxxo", "customer_balance"],
      payment_method_options: {
        customer_balance: {
          funding_type: "bank_transfer",
          bank_transfer: {
            type: "mx_bank_transfer",
            // El rail bancario para México es "spei" (la lista válida que devuelve Stripe es
            // aba, swift, sort_code, zengin, sepa, spei, iban).
            requested_address_types: ["spei"],
          },
        },
      },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      metadata: { eventId, type: "one-time", userId: user.id },
      customer: stripeCustomerId,
      locale: "es-419",
    });

    await prisma.event.update({
      where: { id: eventId },
      data: { stripeCheckoutId: session.id },
    });

    if (!session.url) {
      return { success: false, error: "No se pudo generar URL de checkout" };
    }

    return { success: true, url: session.url };
  } catch (error) {
    console.error("[createOneTimeCheckout]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo crear el checkout",
    };
  }
}

export async function createSubscriptionCheckout(
  plan: "ORGANIZADOR_PLUS" | "ORGANIZADOR_PRO",
): Promise<BillingActionResult> {
  try {
    const user = await requireUser();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, stripeCustomerId: true, subscription: true },
    });

    if (!dbUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    if (dbUser.subscription && dbUser.subscription.status === "ACTIVE") {
      return {
        success: false,
        error: "Ya tienes una suscripción activa. Gestiónala desde el portal.",
      };
    }

    const priceId =
      plan === "ORGANIZADOR_PLUS"
        ? STRIPE_PRICES.organizadorPlus
        : STRIPE_PRICES.organizadorPro;

    if (!priceId) {
      return { success: false, error: "Price ID de suscripción no configurado" };
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_BASE_URL no está configurada" };
    }

    const stripeCustomerId = await ensureStripeCustomer(dbUser.id);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      metadata: { userId: dbUser.id, type: "subscription", plan },
      customer: stripeCustomerId,
      locale: "es-419",
    });

    if (!session.url) {
      return { success: false, error: "No se pudo generar URL de checkout" };
    }

    return { success: true, url: session.url };
  } catch (error) {
    console.error("[createSubscriptionCheckout]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo crear el checkout",
    };
  }
}

export async function createCustomerPortalSession(): Promise<BillingActionResult> {
  try {
    const user = await requireUser();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    if (!dbUser?.stripeCustomerId) {
      return { success: false, error: "No hay cliente de Stripe vinculado todavía" };
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_BASE_URL no está configurada" };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing`,
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error("[createCustomerPortalSession]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo crear sesión del portal",
    };
  }
}
