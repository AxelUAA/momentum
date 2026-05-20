import "server-only";

import { Resend } from "resend";
import type { ReactElement } from "react";

const resendKey = process.env.RESEND_API_KEY;

if (!resendKey) {
  console.warn("[email] RESEND_API_KEY no configurada — emails no se enviarán");
}

export const resend = resendKey ? new Resend(resendKey) : null;

// onboarding@resend.dev SOLO puede enviar al dueño de la cuenta Resend.
// Para enviar a clientes reales: verifica un dominio en resend.com/domains
// y setea RESEND_FROM_EMAIL=Momentum <noreply@tudominio.com>
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Momentum <hola@momentuminvites.com>";

export const REPLY_TO_EMAIL =
  process.env.RESEND_REPLY_TO || "axelinm11@gmail.com";

// Dev only: redirige TODOS los emails a este destinatario para probar sin
// dominio verificado. Ej: RESEND_TO_OVERRIDE=axelinm11@gmail.com
const TO_OVERRIDE = process.env.RESEND_TO_OVERRIDE ?? null;

type SendEmailParams = {
  to: string;
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

export async function sendEmail({
  to,
  subject,
  react,
  replyTo,
}: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn(`[email] skip send (no Resend client): to=${to} subject="${subject}"`);
    return { success: false, error: "Resend no configurado" };
  }

  if (!to || !to.includes("@")) {
    console.warn(`[email] skip send (email inválido): to=${to}`);
    return { success: false, error: "Email destinatario inválido" };
  }

  const recipient = TO_OVERRIDE ?? to;
  if (TO_OVERRIDE) {
    console.info(`[email] TO_OVERRIDE activo → redirigiendo ${to} → ${recipient}`);
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject,
      react,
      replyTo: replyTo ?? REPLY_TO_EMAIL,
    });

    if (result.error) {
      console.error(`[email] Resend error: to=${recipient} subject="${subject}"`, result.error);
      return { success: false, error: result.error.message };
    }

    console.info(`[email] enviado OK: id=${result.data?.id} to=${recipient} subject="${subject}"`);
    return { success: true, id: result.data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error(`[email] send threw: to=${recipient} subject="${subject}"`, error);
    return { success: false, error: message };
  }
}

export async function sendStatusEmail(
  event: { id: string; title: string; slug: string; user: { email: string; name: string | null }; clientToken?: string | null },
  newStatus: string
) {
  if (!resend) return { success: false, error: "Resend no configurado" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://momentuminvites.com";
  const portalUrl = event.clientToken
    ? `${baseUrl}/portal/${event.clientToken}`
    : `${baseUrl}/dashboard/events/${event.id}/progress`;
  const invitationUrl = `${baseUrl}/e/${event.slug}`;
  const to = event.user.email;

  let reactElement: ReactElement | null = null;
  let subject = "";

  switch (newStatus) {
    case "INTAKE_COMPLETE": {
      const IntakeReceivedEmail = (await import("@/emails/IntakeReceivedEmail")).default;
      subject = "Recibimos todo — estamos construyendo tu invitación ✨";
      reactElement = IntakeReceivedEmail({ eventName: event.title, portalUrl });
      break;
    }
    case "BUILDING": {
      const BuildingStartedEmail = (await import("@/emails/BuildingStartedEmail")).default;
      subject = "Estamos diseñando tu invitación 🎨";
      reactElement = BuildingStartedEmail({ eventName: event.title, portalUrl });
      break;
    }
    case "REVIEW": {
      const ReadyForReviewEmail = (await import("@/emails/ReadyForReviewEmail")).default;
      subject = "¡Tu invitación está lista! 🎉 Revísala ahora";
      reactElement = ReadyForReviewEmail({ eventName: event.title, invitationUrl, portalUrl });
      break;
    }
    case "CHANGES_REQUESTED": {
      const ChangesRequestedEmail = (await import("@/emails/ChangesRequestedEmail")).default;
      subject = "Necesitamos un ajuste para tu invitación";
      reactElement = ChangesRequestedEmail({ eventName: event.title, portalUrl });
      break;
    }
    case "ACTIVE": {
      const InvitationLiveEmail = (await import("@/emails/InvitationLiveEmail")).default;
      subject = "🎊 Tu invitación está activa — ¡compártela!";
      reactElement = InvitationLiveEmail({ eventName: event.title, invitationUrl });
      break;
    }
    default:
      return { success: false, error: "Status ignored for emails" };
  }

  if (reactElement && subject) {
    return sendEmail({ to, subject, react: reactElement });
  }

  return { success: false, error: "No email mapped for this status" };
}
