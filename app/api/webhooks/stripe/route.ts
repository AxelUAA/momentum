import Stripe from "stripe";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// Stripe envía retries; respondemos 200 a casos benignos (sesión que no nos pertenece,
// fixtures de `stripe trigger`, etc.) para evitar reintentos infinitos. 400 SOLO es
// para signature inválida. 500 SOLO para errores reales (DB caída).

function plus60Days(baseDate?: Date | null): Date {
  const base = baseDate ?? new Date();
  const next = new Date(base);
  next.setDate(next.getDate() + 60);
  return next;
}

function mapSubscriptionStatus(
  status?: string,
):
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "TRIALING"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "UNPAID" {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "trialing":
      return "TRIALING";
    case "incomplete":
      return "INCOMPLETE";
    case "incomplete_expired":
      return "INCOMPLETE_EXPIRED";
    case "unpaid":
      return "UNPAID";
    default:
      return "ACTIVE";
  }
}

/**
 * Lee current_period_end de la suscripción.
 * En API >= 2025, Stripe movió este campo a `subscription.items.data[0].current_period_end`.
 * Mantenemos fallback al field legacy por compatibilidad con eventos viejos.
 */
function readPeriodEnd(subscription: Stripe.Subscription): Date {
  const items = subscription.items?.data ?? [];
  const fromItem =
    items.length > 0
      ? (items[0] as unknown as { current_period_end?: number }).current_period_end
      : undefined;
  const legacy = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
  const unix = fromItem ?? legacy;
  return unix ? new Date(unix * 1000) : plus60Days(new Date());
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    console.error("[stripe webhook] missing stripe-signature header");
    return new Response("missing signature header", { status: 400 });
  }
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET no configurado");
    return new Response("missing webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[stripe webhook] signature error:", message);
    return new Response(`signature error: ${message}`, { status: 400 });
  }

  // Idempotencia: si ya procesamos este evento, regresamos 200.
  const existing = await prisma.paymentLog.findUnique({
    where: { stripeEventId: event.id },
    select: { id: true },
  });
  if (existing) {
    return new Response(null, { status: 200 });
  }

  try {
    let eventId: string | undefined;
    let userId: string | undefined;

    // Procesamos el evento Y el log en una sola transacción para que la idempotencia
    // sea real: si algo falla después del update, el log no queda y Stripe reintenta.
    await prisma.$transaction(async (tx) => {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          if (session.mode === "payment") {
            const target = await tx.event.findUnique({
              where: { stripeCheckoutId: session.id },
              select: { id: true, userId: true, eventDate: true },
            });

            // Fixture de `stripe trigger` u otra app: no es nuestro. Skip silencioso.
            if (!target) {
              console.warn(
                `[stripe webhook] checkout.session.completed para session_id=${session.id} sin evento en DB — skip`,
              );
              break;
            }

            if (session.payment_status === "paid") {
              await tx.event.update({
                where: { id: target.id },
                data: {
                  paymentStatus: "PAID",
                  paidAt: new Date(),
                  activeUntil: plus60Days(target.eventDate),
                  stripePaymentIntentId:
                    typeof session.payment_intent === "string"
                      ? session.payment_intent
                      : null,
                },
              });
            } else if (session.payment_status === "unpaid") {
              await tx.event.update({
                where: { id: target.id },
                data: { paymentStatus: "PENDING_VOUCHER" },
              });
            }
            eventId = target.id;
            userId = target.userId;
          }

          if (session.mode === "subscription") {
            const metadataPlan = session.metadata?.plan;
            const plan =
              metadataPlan === "ORGANIZADOR_PLUS" || metadataPlan === "ORGANIZADOR_PRO"
                ? metadataPlan
                : null;
            const dbUserId = session.metadata?.userId;

            if (!session.subscription || !session.customer || !plan || !dbUserId) {
              console.warn(
                "[stripe webhook] checkout.session.completed (subscription) con metadata incompleta — skip",
              );
              break;
            }

            const stripeSubscriptionId =
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription.id;
            const stripeCustomerId =
              typeof session.customer === "string" ? session.customer : session.customer.id;

            // Retrieve para obtener el shape correcto con items.data[0].current_period_end
            const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
            const periodEnd = readPeriodEnd(subscription);

            await tx.subscription.upsert({
              where: { userId: dbUserId },
              update: {
                stripeCustomerId,
                stripeSubscriptionId,
                plan,
                // Cast: los nuevos valores del enum (INCOMPLETE/INCOMPLETE_EXPIRED/UNPAID)
              // se reconocen tras `prisma generate` post-schema-change.
              status: mapSubscriptionStatus(subscription.status) as "ACTIVE",
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
              },
              create: {
                userId: dbUserId,
                stripeCustomerId,
                stripeSubscriptionId,
                plan,
                // Cast: los nuevos valores del enum (INCOMPLETE/INCOMPLETE_EXPIRED/UNPAID)
              // se reconocen tras `prisma generate` post-schema-change.
              status: mapSubscriptionStatus(subscription.status) as "ACTIVE",
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
              },
            });

            await tx.user.update({
              where: { id: dbUserId },
              data: { stripeCustomerId },
            });
            userId = dbUserId;
          }
          break;
        }

        case "checkout.session.async_payment_succeeded": {
          const session = event.data.object as Stripe.Checkout.Session;
          const target = await tx.event.findUnique({
            where: { stripeCheckoutId: session.id },
            select: { id: true, userId: true, eventDate: true },
          });
          if (!target) {
            console.warn(
              `[stripe webhook] async_payment_succeeded session_id=${session.id} sin evento — skip`,
            );
            break;
          }
          await tx.event.update({
            where: { id: target.id },
            data: {
              paymentStatus: "PAID",
              paidAt: new Date(),
              activeUntil: plus60Days(target.eventDate),
              stripePaymentIntentId:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : null,
            },
          });
          eventId = target.id;
          userId = target.userId;
          break;
        }

        case "checkout.session.async_payment_failed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const target = await tx.event.findUnique({
            where: { stripeCheckoutId: session.id },
            select: { id: true, userId: true },
          });
          if (!target) {
            console.warn(
              `[stripe webhook] async_payment_failed session_id=${session.id} sin evento — skip`,
            );
            break;
          }
          await tx.event.update({
            where: { id: target.id },
            data: { paymentStatus: "EXPIRED" },
          });
          eventId = target.id;
          userId = target.userId;
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const existingSub = await tx.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
            select: { userId: true },
          });
          if (!existingSub) {
            console.warn(
              `[stripe webhook] ${event.type} sub_id=${subscription.id} sin registro local — skip (probable race con checkout.session.completed)`,
            );
            break;
          }
          await tx.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              // Cast: los nuevos valores del enum (INCOMPLETE/INCOMPLETE_EXPIRED/UNPAID)
              // se reconocen tras `prisma generate` post-schema-change.
              status: mapSubscriptionStatus(subscription.status) as "ACTIVE",
              currentPeriodEnd: readPeriodEnd(subscription),
              cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
            },
          });
          userId = existingSub.userId;
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const existingSub = await tx.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
            select: { userId: true },
          });
          if (!existingSub) {
            console.warn(
              `[stripe webhook] subscription.deleted sub_id=${subscription.id} sin registro local — skip`,
            );
            break;
          }
          await tx.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: "CANCELED" },
          });
          userId = existingSub.userId;
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionRef = (invoice as unknown as { subscription?: string | { id: string } })
            .subscription;
          if (!subscriptionRef) break;
          const subscriptionId =
            typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
          const existingSub = await tx.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
            select: { userId: true },
          });
          if (!existingSub) {
            console.warn(
              `[stripe webhook] invoice.payment_failed sub_id=${subscriptionId} sin registro local — skip`,
            );
            break;
          }
          await tx.subscription.update({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: "PAST_DUE" },
          });
          userId = existingSub.userId;
          break;
        }

        default:
          // Eventos que no nos interesan (ej: customer.created sin metadata) — los logueamos
          // sin tocar nada. La inserción en paymentLog ocurre fuera del switch.
          break;
      }

      const dataObject = event.data.object as unknown as Record<string, unknown>;
      const maybeAmount =
        typeof dataObject.amount_total === "number"
          ? dataObject.amount_total
          : typeof dataObject.amount_due === "number"
            ? dataObject.amount_due
            : typeof dataObject.amount === "number"
              ? dataObject.amount
              : null;
      const maybeCurrency =
        typeof dataObject.currency === "string" ? dataObject.currency.toUpperCase() : null;

      await tx.paymentLog.create({
        data: {
          stripeEventId: event.id,
          type: event.type,
          amount: maybeAmount,
          currency: maybeCurrency,
          rawPayload: event.data.object as unknown as Prisma.InputJsonValue,
          eventId,
          userId,
        },
      });
    });

    return new Response(null, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[stripe webhook] processing error (${event.type}):`, message);
    return new Response(`processing error: ${message}`, { status: 500 });
  }
}
