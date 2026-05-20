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

interface PortalRecoveryEmailProps {
  clientName: string;
  eventTitle: string;
  portalUrl: string;
}

export default function PortalRecoveryEmail({
  clientName,
  eventTitle,
  portalUrl,
}: PortalRecoveryEmailProps) {
  return (
    <EmailLayout preview={`Tu link de acceso a ${eventTitle}`}>
      <Text style={heading1Style}>Hola, {clientName}</Text>

      <Text style={paragraphStyle}>
        Aquí está el link de acceso a tu portal para{" "}
        <strong>{eventTitle}</strong>. Úsalo para ver el estado de tu
        invitación y llenar los detalles de tu evento.
      </Text>

      <Section style={{ textAlign: "center" as const, margin: "28px 0" }}>
        <Button href={portalUrl} style={buttonStyle}>
          Abrir mi portal →
        </Button>
      </Section>

      <Section style={cardStyle}>
        <Text style={labelStyle}>Tu enlace de acceso</Text>
        <Text style={{ ...valueStyle, wordBreak: "break-all" as const, fontSize: "13px" }}>
          {portalUrl}
        </Text>
      </Section>

      <Text style={subtleParagraphStyle}>
        Guarda este enlace — es tu acceso directo. No necesitas crear una cuenta.
        Si no solicitaste este correo, simplemente ignóralo.
      </Text>
    </EmailLayout>
  );
}
