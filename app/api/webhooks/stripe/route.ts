import Stripe from "stripe";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  sendPaymentConfirmedNotification,
  sendVoucherPendingNotification,
  sendClientWelcomeEmail,
} from "@/lib/email-senders";

// ─── Email intents ──────────────────────────────────────────────────────────
// Se acumulan durante el switch y se envían FUERA de la transacción.
// Así un fallo de email no hace rollback ni mete latencia en la conexión DB.
type EmailIntent =
  | { type: "payment-confirmed"; eventId: string; amountCents: number | null }
  | { type: "voucher-pending"; eventId: string; sessionId: string; amountCents: number | null }
  | {
      type: "client-welcome";
      clientEmail: string;
      clientName: string;
      planName: string;
      amountCents: number | null;
      clientToken: string;
    };

function plus60Days(baseDate?: Date | null): Date {
  const base = baseDate ?? new Date();
  const next = new Date(base);
  next.setDate(next.getDate() + 60);
  return next;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function tierLabel(tier: string): string {
  return tier === "LUXURY" ? "Invitación Premium" : "Invitación Pro";
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
    case "active":       return "ACTIVE";
    case "past_due":     return "PAST_DUE";
    case "canceled":     return "CANCELED";
    case "trialing":     return "TRIALING";
    case "incomplete":   return "INCOMPLETE";
    case "incomplete_expired": return "INCOMPLETE_EXPIRED";
    case "unpaid":       return "UNPAID";
    default:             return "ACTIVE";
  }
}

function readPeriodEnd(subscription: Stripe.Subscription): Date {
  const items = subscription.items?.data ?? [];
  const fromItem =
    items.length > 0
      ? (items[0] as unknown as { current_period_end?: number }).current_period_end
      : undefined;
  const legacy = (subscription as unknown as { current_period_end?: number }).current_period_end;
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

  // Idempotencia: si ya procesamos este evento, respondemos 200 sin tocar nada.
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
    const emailIntents: EmailIntent[] = [];

    await prisma.$transaction(async (tx) => {
      switch (event.type) {

        // ──────────────────────────────────────────────────────────────────
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          // ── A) PAGO PÚBLICO (landing → Stripe → portal del cliente) ────
          if (session.metadata?.type === "public-checkout") {
            // El success page puede haber creado el evento antes que este webhook.
            // Si ya existe, solo registramos el eventId/userId para el PaymentLog.
            const alreadyFulfilled = await tx.event.findFirst({
              where: { stripeCheckoutId: session.id },
              select: { id: true, userId: true },
            });
            if (alreadyFulfilled) {
              eventId = alreadyFulfilled.id;
              userId = alreadyFulfilled.userId;
              break;
            }

            const clientName = session.metadata.clientName ?? "Cliente";
            const clientEmail =
              session.metadata.clientEmail ??
              session.customer_details?.email ??
              null;
            const tier =
              session.metadata.tier === "LUXURY" ? "LUXURY" : "ESSENTIAL";

            // Plantilla y tipo de evento desde metadata
            const templateSlug = session.metadata.templateSlug ?? "aurora";
            const VALID_EVENT_TYPES = [
              "WEDDING", "XV", "BIRTHDAY", "BABY_SHOWER", "BAPTISM", "GRADUATION", "CORPORATE",
            ];
            const rawEventType = session.metadata.eventType ?? "WEDDING";
            const eventType = VALID_EVENT_TYPES.includes(rawEventType) ? rawEventType : "WEDDING";

            if (!clientEmail) {
              console.warn("[stripe webhook] public-checkout sin email — skip");
              break;
            }

            const stripeCustomerId =
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id ?? null;

            // Upsert del usuario por email
            const user = await tx.user.upsert({
              where: { email: clientEmail },
              update: stripeCustomerId ? { stripeCustomerId } : {},
              create: {
                email: clientEmail,
                name: clientName,
                stripeCustomerId: stripeCustomerId ?? undefined,
              },
            });

            // Buscar template por slug (con fallback a "aurora")
            const template =
              (await tx.template.findUnique({
                where: { slug: templateSlug },
                select: { id: true },
              })) ??
              (await tx.template.findUnique({
                where: { slug: "aurora" },
                select: { id: true },
              }));

            if (!template) {
              console.error("[stripe webhook] ningún template encontrado");
              break;
            }

            // Generar slug único
            const baseSlug = slugify(clientName);
            const suffix = Date.now().toString(36);
            const slug = `${baseSlug}-${suffix}`;

            // Generar clientToken único
            const clientToken = crypto.randomUUID();

            const isPaid = session.payment_status === "paid";

            const newEvent = await tx.event.create({
              data: {
                userId: user.id,
                templateId: template.id,
                title: `Invitación de ${clientName}`,
                slug,
                type: eventType as any,
                tier,
                status: "PAID",
                paymentStatus: isPaid ? "PAID" : "PENDING_VOUCHER",
                paidAt: isPaid ? new Date() : null,
                activeUntil: plus60Days(null),
                stripeCheckoutId: session.id,
                stripePaymentIntentId:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : null,
                clientToken,
                clientName,
                clientEmail,
              },
            });

            eventId = newEvent.id;
            userId = user.id;

            if (isPaid) {
              emailIntents.push({
                type: "client-welcome",
                clientEmail,
                clientName,
                planName: tierLabel(tier),
                amountCents: session.amount_total ?? null,
                clientToken,
              });
            } else {
              // OXXO: voucher pendiente — enviar ficha pero también el portal
              emailIntents.push({
                type: "voucher-pending",
                eventId: newEvent.id,
                sessionId: session.id,
                amountCents: session.amount_total ?? null,
              });
            }
            break;
          }

          // ── B) PAGO DESDE DASHBOARD (flujo admin existente) ─────────────
          if (session.mode === "payment") {
            const target = await tx.event.findFirst({
              where: { stripeCheckoutId: session.id },
              select: { id: true, userId: true, eventDate: true },
            });

            if (!target) {
              console.warn(
                `[stripe webhook] checkout.session.completed session_id=${session.id} sin evento — skip`,
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
              emailIntents.push({
                type: "payment-confirmed",
                eventId: target.id,
                amountCents: session.amount_total ?? null,
              });
            } else if (session.payment_status === "unpaid") {
              await tx.event.update({
                where: { id: target.id },
                data: { paymentStatus: "PENDING_VOUCHER" },
              });
              emailIntents.push({
                type: "voucher-pending",
                eventId: target.id,
                sessionId: session.id,
                amountCents: session.amount_total ?? null,
              });
            }
            eventId = target.id;
            userId = target.userId;
          }

          // ── C) SUSCRIPCIÓN ───────────────────────────────────────────────
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
              typeof session.customer === "string"
                ? session.customer
                : session.customer.id;

            const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
            const periodEnd = readPeriodEnd(subscription);

            await tx.subscription.upsert({
              where: { userId: dbUserId },
              update: {
                stripeCustomerId,
                stripeSubscriptionId,
                plan,
                status: mapSubscriptionStatus(subscription.status) as "ACTIVE",
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
              },
              create: {
                userId: dbUserId,
                stripeCustomerId,
                stripeSubscriptionId,
                plan,
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

        // ──────────────────────────────────────────────────────────────────
        // @ts-expect-error: Stripe SDK version may not explicitly list this event
        case "checkout.session.async_payment_requires_action": {
          // @ts-expect-error
          const session = event.data.object as Stripe.Checkout.Session;

          const target = await tx.event.findFirst({
            where: { stripeCheckoutId: session.id },
            select: { id: true, userId: true },
          });

          if (target) {
            await tx.event.update({
              where: { id: target.id },
              data: { paymentStatus: "PENDING_VOUCHER" },
            });
            emailIntents.push({
              type: "voucher-pending",
              eventId: target.id,
              sessionId: session.id,
              amountCents: session.amount_total ?? null,
            });
            eventId = target.id;
            userId = target.userId;
          } else {
            console.warn(`[stripe webhook] async_payment_requires_action session_id=${session.id} sin evento — skip`);
          }
          break;
        }

        // ──────────────────────────────────────────────────────────────────
        case "checkout.session.async_payment_succeeded": {
          const session = event.data.object as Stripe.Checkout.Session;

          // Flujo público: el evento existe pero el pago era OXXO/SPEI y ya liquidó
          if (session.metadata?.type === "public-checkout") {
            const newEvent = await tx.event.findFirst({
              where: { stripeCheckoutId: session.id },
              select: { id: true, userId: true, clientToken: true, clientName: true, clientEmail: true, tier: true },
            });
            if (newEvent) {
              await tx.event.update({
                where: { id: newEvent.id },
                data: {
                  paymentStatus: "PAID",
                  paidAt: new Date(),
                  stripePaymentIntentId:
                    typeof session.payment_intent === "string" ? session.payment_intent : null,
                },
              });
              if (newEvent.clientEmail && newEvent.clientToken) {
                emailIntents.push({
                  type: "client-welcome",
                  clientEmail: newEvent.clientEmail,
                  clientName: newEvent.clientName ?? "Cliente",
                  planName: tierLabel(newEvent.tier),
                  amountCents: session.amount_total ?? null,
                  clientToken: newEvent.clientToken,
                });
              }
              eventId = newEvent.id;
              userId = newEvent.userId;
            }
            break;
          }

          const target = await tx.event.findFirst({
            where: { stripeCheckoutId: session.id },
            select: { id: true, userId: true, eventDate: true },
          });
          if (!target) {
            console.warn(`[stripe webhook] async_payment_succeeded session_id=${session.id} sin evento — skip`);
            break;
          }
          await tx.event.update({
            where: { id: target.id },
            data: {
              paymentStatus: "PAID",
              paidAt: new Date(),
              activeUntil: plus60Days(target.eventDate),
              stripePaymentIntentId:
                typeof session.payment_intent === "string" ? session.payment_intent : null,
            },
          });
          emailIntents.push({
            type: "payment-confirmed",
            eventId: target.id,
            amountCents: session.amount_total ?? null,
          });
          eventId = target.id;
          userId = target.userId;
          break;
        }

        // ──────────────────────────────────────────────────────────────────
        case "checkout.session.async_payment_failed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const target = await tx.event.findFirst({
            where: { stripeCheckoutId: session.id },
            select: { id: true, userId: true },
          });
          if (!target) {
            console.warn(`[stripe webhook] async_payment_failed session_id=${session.id} sin evento — skip`);
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

        // ──────────────────────────────────────────────────────────────────
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const existingSub = await tx.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
            select: { userId: true },
          });
          if (!existingSub) {
            console.warn(`[stripe webhook] ${event.type} sub_id=${subscription.id} sin registro local — skip`);
            break;
          }
          await tx.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              status: mapSubscriptionStatus(subscription.status) as "ACTIVE",
              currentPeriodEnd: readPeriodEnd(subscription),
              cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
            },
          });
          userId = existingSub.userId;
          break;
        }

        // ──────────────────────────────────────────────────────────────────
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const existingSub = await tx.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
            select: { userId: true },
          });
          if (!existingSub) {
            console.warn(`[stripe webhook] subscription.deleted sub_id=${subscription.id} sin registro — skip`);
            break;
          }
          await tx.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: "CANCELED" },
          });
          userId = existingSub.userId;
          break;
        }

        // ──────────────────────────────────────────────────────────────────
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionRef = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
          if (!subscriptionRef) break;
          const subscriptionId =
            typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
          const existingSub = await tx.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
            select: { userId: true },
          });
          if (!existingSub) {
            console.warn(`[stripe webhook] invoice.payment_failed sub_id=${subscriptionId} sin registro — skip`);
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

    // ── Flush emails FUERA del transaction ────────────────────────────────
    for (const intent of emailIntents) {
      try {
        if (intent.type === "payment-confirmed") {
          await sendPaymentConfirmedNotification({
            eventId: intent.eventId,
            amountCents: intent.amountCents,
          });
        } else if (intent.type === "voucher-pending") {
          await sendVoucherPendingNotification({
            eventId: intent.eventId,
            sessionId: intent.sessionId,
            amountCents: intent.amountCents,
          });
        } else if (intent.type === "client-welcome") {
          await sendClientWelcomeEmail({
            clientEmail: intent.clientEmail,
            clientName: intent.clientName,
            planName: intent.planName,
            amountCents: intent.amountCents,
            clientToken: intent.clientToken,
          });
        }
      } catch (err) {
        console.error(`[stripe webhook] email send failed (${intent.type}):`, err);
      }
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[stripe webhook] processing error (${event.type}):`, message);
    return new Response(`webhook error: ${message}`, { status: 500 });
  }
}
