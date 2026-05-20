"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendClientWelcomeEmail } from "@/lib/email-senders";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function plus60Days(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d;
}

function tierLabel(tier: string): string {
  return tier === "LUXURY" ? "Invitación Premium" : "Invitación Pro";
}

const VALID_EVENT_TYPES = [
  "WEDDING", "XV", "BIRTHDAY", "BABY_SHOWER", "BAPTISM", "GRADUATION", "CORPORATE",
];

/**
 * Crea el evento y lo vincula al usuario autenticado.
 * Se llama desde el success page al confirmar el pago — NO depende del webhook.
 * Es idempotente: si el evento ya existe (creado por webhook) solo devuelve el id.
 */
export async function fulfillPublicCheckout(sessionId: string): Promise<{
  eventId: string | null;
  clientEmail: string | null;
}> {
  // Idempotencia: si el webhook ya procesó esto, solo devolvemos el id
  const existing = await prisma.event.findFirst({
    where: { stripeCheckoutId: sessionId },
    select: { id: true, clientEmail: true },
  });
  if (existing?.id) {
    return { eventId: existing.id, clientEmail: existing.clientEmail };
  }

  // Verificar el pago directamente con Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (
    session.payment_status !== "paid" ||
    session.metadata?.type !== "public-checkout"
  ) {
    return { eventId: null, clientEmail: null };
  }

  const clientName = session.metadata.clientName ?? "Cliente";
  const rawEmail = session.metadata.clientEmail ?? session.customer_details?.email ?? null;
  const clientEmail = rawEmail?.toLowerCase() ?? null;
  const tier = session.metadata.tier === "LUXURY" ? "LUXURY" : "ESSENTIAL";
  const templateSlug = session.metadata.templateSlug ?? "aurora";
  const rawEventType = session.metadata.eventType ?? "WEDDING";
  const eventType = VALID_EVENT_TYPES.includes(rawEventType) ? rawEventType : "WEDDING";
  const metaUserId = session.metadata.userId ?? null;

  if (!clientEmail) {
    console.error("[fulfillPublicCheckout] sin email — sessionId:", sessionId);
    return { eventId: null, clientEmail: null };
  }

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer as { id: string } | null)?.id ?? null;

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  // Resolve user: prefer userId from metadata (new flow), fallback to email upsert (legacy)
  let user: { id: string };
  if (metaUserId) {
    const found = await prisma.user.findUnique({
      where: { id: metaUserId },
      select: { id: true },
    });
    if (found) {
      user = found;
      if (stripeCustomerId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId },
        }).catch(() => {});
      }
    } else {
      // Fallback: upsert by email
      user = await prisma.user.upsert({
        where: { email: clientEmail },
        update: stripeCustomerId ? { stripeCustomerId } : {},
        create: { email: clientEmail, name: clientName, stripeCustomerId: stripeCustomerId ?? undefined },
      });
    }
  } else {
    // Legacy flow: no userId in metadata
    user = await prisma.user.upsert({
      where: { email: clientEmail },
      update: stripeCustomerId ? { stripeCustomerId } : {},
      create: { email: clientEmail, name: clientName, stripeCustomerId: stripeCustomerId ?? undefined },
    });
  }

  // Buscar plantilla
  const template =
    (await prisma.template.findUnique({ where: { slug: templateSlug }, select: { id: true } })) ??
    (await prisma.template.findUnique({ where: { slug: "aurora" }, select: { id: true } }));

  if (!template) {
    console.error("[fulfillPublicCheckout] ningún template encontrado");
    return { eventId: null, clientEmail };
  }

  const slug = `${slugify(clientName)}-${Date.now().toString(36)}`;
  const clientToken = crypto.randomUUID();

  try {
    const newEvent = await prisma.event.create({
      data: {
        userId: user.id,
        templateId: template.id,
        title: `Invitación de ${clientName}`,
        slug,
        type: eventType as any,
        tier,
        status: "PAID",
        paymentStatus: "PAID",
        paidAt: new Date(),
        activeUntil: plus60Days(),
        stripeCheckoutId: sessionId,
        stripePaymentIntentId: paymentIntentId,
        clientToken,
        clientName,
        clientEmail,
      },
    });

    await prisma.paymentLog.create({
      data: {
        stripeEventId: `fulfillment-${sessionId}`,
        type: "checkout.session.completed",
        amount: session.amount_total,
        currency: session.currency?.toUpperCase() ?? "MXN",
        rawPayload: session as unknown as Prisma.InputJsonValue,
        eventId: newEvent.id,
        userId: user.id,
      },
    }).catch((err) => {
      console.warn("[fulfillPublicCheckout] paymentLog skip:", (err as Error).message);
    });

    // Email de bienvenida (sin link de portal, ahora es dashboard)
    await sendClientWelcomeEmail({
      clientEmail,
      clientName,
      planName: tierLabel(tier),
      amountCents: session.amount_total,
      clientToken,
    });

    console.info(`[fulfillPublicCheckout] OK — event=${newEvent.id}`);
    return { eventId: newEvent.id, clientEmail };
  } catch (err) {
    // Race condition: el webhook ganó
    const race = await prisma.event.findFirst({
      where: { stripeCheckoutId: sessionId },
      select: { id: true, clientEmail: true },
    });
    if (race?.id) {
      console.info("[fulfillPublicCheckout] race resolved — usando id del webhook");
      return { eventId: race.id, clientEmail: race.clientEmail };
    }
    throw err;
  }
}
