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

interface InvitationLiveEmailProps {
  eventName: string;
  invitationUrl: string;
}

export default function InvitationLiveEmail({ eventName, invitationUrl }: InvitationLiveEmailProps) {
  return (
    <EmailLayout preview="🎊 Tu invitación está activa — ¡compártela!">
      <Text style={heading1Style}>¡Tu invitación está en vivo! 🎊</Text>

      <Text style={paragraphStyle}>
        ¡Excelentes noticias! Tu invitación para <strong>{eventName}</strong> ha sido aprobada y ya está oficialmente activa.
      </Text>

      <Section style={cardStyle}>
        <Text style={labelStyle}>Tu enlace para compartir</Text>
        <Text style={{ ...valueStyle, wordBreak: "break-all" as const, fontSize: "14px", marginTop: "4px" }}>
          {invitationUrl}
        </Text>
      </Section>

      <Section style={cardStyle}>
        <Text style={{ ...paragraphStyle, margin: "0 0 10px 0" }}>
          📱 <strong>¿Cómo compartir por WhatsApp?</strong>
        </Text>
        <Text style={{ ...paragraphStyle, margin: "0" }}>
          Copia el enlace superior y pégalo en tus chats de WhatsApp. Tus invitados verán automáticamente una vista previa hermosa con el título de tu evento. ¡Asegúrate de que tus invitados se registren a través de este enlace!
        </Text>
      </Section>

      <Section style={{ textAlign: "center" as const, margin: "28px 0" }}>
        <Button href={invitationUrl} style={buttonStyle}>
          Ir a mi invitación →
        </Button>
      </Section>

      <Text style={subtleParagraphStyle}>
        Puedes monitorear las confirmaciones de asistencia (RSVP) directamente desde el portal de tu evento en cualquier momento. ¡Que disfrutes tu evento!
      </Text>
    </EmailLayout>
  );
}
