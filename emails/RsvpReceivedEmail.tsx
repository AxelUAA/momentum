import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  buttonStyle,
  cardStyle,
  heading1Style,
  labelStyle,
  paragraphStyle,
  subtleParagraphStyle,
  valueStyle,
} from "./components/EmailLayout";

interface RsvpReceivedEmailProps {
  /** Nombre del organizador */
  organizerName: string;
  /** Título del evento */
  eventTitle: string;
  /** Nombre del invitado que respondió */
  guestName: string;
  /** Estado de la respuesta */
  status: "CONFIRMED" | "DECLINED" | "MAYBE" | "PENDING";
  /** Cantidad de personas confirmadas (0 si declinó) */
  confirmedGuests: number;
  /** Mensaje opcional del invitado */
  message: string | null;
  /** Restricciones alimentarias del invitado (si aplica) */
  dietaryRestrictions: string | null;
  /** URL del dashboard de invitados del evento */
  guestsDashboardUrl: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  CONFIRMED: { label: "confirmó", color: "#5B8C7B", emoji: "✅" },
  DECLINED: { label: "declinó la invitación", color: "#9B3A4E", emoji: "❌" },
  MAYBE: { label: "respondió 'tal vez'", color: "#D4AF7A", emoji: "🤔" },
  PENDING: { label: "actualizó su RSVP", color: "#5A6373", emoji: "📝" },
};

export default function RsvpReceivedEmail({
  organizerName,
  eventTitle,
  guestName,
  status,
  confirmedGuests,
  message,
  dietaryRestrictions,
  guestsDashboardUrl,
}: RsvpReceivedEmailProps) {
  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.PENDING;

  return (
    <EmailLayout
      preview={`${guestName} ${statusInfo.label} para ${eventTitle}`}
    >
      <Text style={heading1Style}>
        {statusInfo.emoji} Nueva respuesta de RSVP
      </Text>

      <Text style={paragraphStyle}>
        Hola {organizerName}, <strong>{guestName}</strong>{" "}
        <span style={{ color: statusInfo.color, fontWeight: 600 }}>
          {statusInfo.label}
        </span>{" "}
        para tu evento <strong>{eventTitle}</strong>.
      </Text>

      <Section style={cardStyle}>
        <Text style={labelStyle}>Invitado</Text>
        <Text style={valueStyle}>{guestName}</Text>

        {status === "CONFIRMED" && confirmedGuests > 0 ? (
          <>
            <Text style={{ ...labelStyle, marginTop: "16px" }}>
              Personas que asistirán
            </Text>
            <Text style={valueStyle}>{confirmedGuests}</Text>
          </>
        ) : null}

        {dietaryRestrictions ? (
          <>
            <Text style={{ ...labelStyle, marginTop: "16px" }}>
              Restricciones alimentarias
            </Text>
            <Text style={{ ...paragraphStyle, margin: "0" }}>
              {dietaryRestrictions}
            </Text>
          </>
        ) : null}

        {message ? (
          <>
            <Text style={{ ...labelStyle, marginTop: "16px" }}>
              Mensaje del invitado
            </Text>
            <Text style={{ ...paragraphStyle, margin: "0", fontStyle: "italic" }}>
              "{message}"
            </Text>
          </>
        ) : null}
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button href={guestsDashboardUrl} style={buttonStyle}>
          Ver todos los RSVPs
        </Button>
      </Section>

      <Text style={subtleParagraphStyle}>
        Te avisaremos cada vez que un invitado responda. Si prefieres no
        recibir estas notificaciones, puedes desactivarlas desde tu panel
        (próximamente).
      </Text>
    </EmailLayout>
  );
}
