import "server-only";

import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { stripe } from "@/lib/stripe";
import PaymentConfirmedEmail from "@/emails/PaymentConfirmedEmail";
import VoucherPendingEmail from "@/emails/VoucherPendingEmail";
import RsvpReceivedEmail from "@/emails/RsvpReceivedEmail";
import ClientWelcomeEmail from "@/emails/ClientWelcomeEmail";
import PortalRecoveryEmail from "@/emails/PortalRecoveryEmail";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://momentum-alpha-six.vercel.app";

function fmtMxn(cents: number | null | undefined): string {
  if (typeof cents !== "number") return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function fmtDate(date: Date | string | null | undefined): string {
  if (!date) return "Fecha por definir";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function firstName(name?: string | null): string {
  if (!name) return "Cliente";
  return name.split(" ")[0] ?? "Cliente";
}

/**
 * Email de pago confirmado al cliente. Combina la confirmación + checklist de
 * próximos pasos (lo que pediste como "Información necesaria del cliente").
 *
 * Se dispara en:
 *   - checkout.session.completed con payment_status=paid (tarjeta)
 *   - checkout.session.async_payment_succeeded (OXXO/SPEI liquidado)
 */
export async function sendPaymentConfirmedNotification(params: {
  eventId: string;
  amountCents: number | null;
}): Promise<void> {
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!event || !event.user.email) {
    console.warn(`[email] sendPaymentConfirmedNotification: evento o email faltante (eventId=${params.eventId})`);
    return;
  }

  await sendEmail({
    to: event.user.email,
    subject: `Pago confirmado · ${event.title}`,
    react: PaymentConfirmedEmail({
      customerName: firstName(event.user.name),
      eventTitle: event.title,
      eventDate: fmtDate(event.eventDate),
      amount: fmtMxn(params.amountCents),
      invitationUrl: `${BASE_URL}/e/${event.slug}`,
      dashboardUrl: `${BASE_URL}/dashboard/events/${event.id}`,
    }),
  });
}

/**
 * Email con la ficha de pago OXXO/SPEI. Se dispara cuando
 * checkout.session.completed tiene payment_status=unpaid (Stripe ya generó el
 * voucher y está esperando que el cliente vaya a pagar).
 *
 * Hace una llamada extra a Stripe para retrievar el PaymentIntent expandido y
 * extraer la referencia (folio OXXO o CLABE SPEI).
 */
export async function sendVoucherPendingNotification(params: {
  eventId: string;
  sessionId: string;
  amountCents: number | null;
}): Promise<void> {
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!event || !event.user.email) {
    console.warn(`[email] sendVoucherPendingNotification: evento o email faltante (eventId=${params.eventId})`);
    return;
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(params.sessionId, {
      expand: ["payment_intent"],
    });
  } catch (err) {
    console.error(`[email] no se pudo retrievar session ${params.sessionId}`, err);
    return;
  }

  const paymentIntent =
    typeof session.payment_intent === "string" || !session.payment_intent
      ? null
      : session.payment_intent;

  let method: "OXXO" | "SPEI" | null = null;
  let reference: string | null = null;
  let expiresAt: string | null = null;

  const nextAction = paymentIntent?.next_action;

  if (nextAction?.type === "oxxo_display_details") {
    method = "OXXO";
    reference = nextAction.oxxo_display_details?.number ?? null;
    const expiresAfter = nextAction.oxxo_display_details?.expires_after;
    if (expiresAfter) {
      expiresAt = fmtDate(new Date(expiresAfter * 1000));
    }
  } else if (nextAction?.type === "display_bank_transfer_instructions") {
    method = "SPEI";
    const instructions = nextAction.display_bank_transfer_instructions;
    const transferData = instructions?.financial_addresses?.[0];
    if (transferData?.type === "spei") {
      reference = transferData.spei?.clabe ?? null;
    }
  }

  if (!method) {
    console.warn(`[email] voucher sin método identificable (sessionId=${params.sessionId})`);
    return;
  }

  await sendEmail({
    to: event.user.email,
    subject: `Tu ficha ${method} · ${event.title}`,
    react: VoucherPendingEmail({
      customerName: firstName(event.user.name),
      eventTitle: event.title,
      amount: fmtMxn(params.amountCents ?? session.amount_total ?? null),
      method,
      reference,
      expiresAt,
    }),
  });
}

/**
 * Email al organizador cuando un invitado hace RSVP. Se dispara desde la
 * server action submitRsvp en app/actions/rsvp.ts.
 */
export async function sendRsvpNotification(params: {
  guestId: string;
  status: "CONFIRMED" | "DECLINED" | "MAYBE" | "PENDING";
  confirmedGuests: number;
  message: string | null;
  dietaryRestrictions: string | null;
}): Promise<void> {
  const guest = await prisma.guest.findUnique({
    where: { id: params.guestId },
    include: {
      event: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (!guest || !guest.event.user.email) {
    console.warn(`[email] sendRsvpNotification: guest o email faltante (guestId=${params.guestId})`);
    return;
  }

  await sendEmail({
    to: guest.event.user.email,
    subject: `[${guest.event.title}] ${guest.name} respondió`,
    react: RsvpReceivedEmail({
      organizerName: firstName(guest.event.user.name),
      eventTitle: guest.event.title,
      guestName: guest.name,
      status: params.status,
      confirmedGuests: params.confirmedGuests,
      message: params.message,
      dietaryRestrictions: params.dietaryRestrictions,
      guestsDashboardUrl: `${BASE_URL}/dashboard/events/${guest.eventId}/guests`,
    }),
  });
}

/**
 * Reenvía el link del portal al cliente cuando lo solicita desde /portal/recuperar.
 * Busca todos los eventos activos del email y manda un correo por cada uno.
 * No revela si el email existe (siempre retorna sin error).
 */
export async function sendPortalRecoveryEmail(email: string): Promise<void> {
  try {
    const events = await prisma.event.findMany({
      where: {
        clientEmail: email,
        clientToken: { not: null },
        status: { notIn: ["ARCHIVED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { clientToken: true, clientName: true, title: true },
    });

    for (const event of events) {
      if (!event.clientToken) continue;
      const portalUrl = `${BASE_URL}/portal/${event.clientToken}`;
      await sendEmail({
        to: email,
        subject: `Tu link de acceso · ${event.title}`,
        react: PortalRecoveryEmail({
          clientName: (event.clientName ?? "Cliente").split(" ")[0],
          eventTitle: event.title,
          portalUrl,
        }),
      });
    }
  } catch (err) {
    console.error("[sendPortalRecoveryEmail]", err);
  }
}

/**
 * Email de bienvenida al cliente con el link a su portal personal.
 * Se dispara desde el webhook de Stripe cuando el pago público es confirmado.
 */
export async function sendClientWelcomeEmail(params: {
  clientEmail: string;
  clientName: string;
  planName: string;
  amountCents: number | null;
  clientToken: string;
}): Promise<void> {
  const portalUrl = params.clientToken === "dashboard" ? `${BASE_URL}/dashboard` : `${BASE_URL}/portal/${params.clientToken}`;

  await sendEmail({
    to: params.clientEmail,
    subject: `¡Tu invitación Momentum está lista para configurar!`,
    react: ClientWelcomeEmail({
      clientName: params.clientName.split(" ")[0] ?? params.clientName,
      planName: params.planName,
      amount: fmtMxn(params.amountCents),
      portalUrl,
    }),
  });
}
