import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  buttonStyle,
  cardStyle,
  heading1Style,
  paragraphStyle,
  subtleParagraphStyle,
} from "./components/EmailLayout";

interface BuildingStartedEmailProps {
  eventName: string;
  portalUrl: string;
}

export default function BuildingStartedEmail({ eventName, portalUrl }: BuildingStartedEmailProps) {
  return (
    <EmailLayout preview="Estamos diseñando tu invitación 🎨">
      <Text style={heading1Style}>¡Manos a la obra! 🛠️</Text>

      <Text style={paragraphStyle}>
        El equipo de Momentum ha comenzado a trabajar oficialmente en el diseño de tu invitación para <strong>{eventName}</strong>.
      </Text>

      <Section style={cardStyle}>
        <Text style={{ ...paragraphStyle, margin: "0" }}>
          Estamos aplicando tu configuración, paleta de colores y contenido para asegurarnos de que quede perfecta. Te notificaremos en cuanto tengamos la primera versión lista para que la revises.
        </Text>
      </Section>

      <Section style={{ textAlign: "center" as const, margin: "28px 0" }}>
        <Button href={portalUrl} style={buttonStyle}>
          Ver estado →
        </Button>
      </Section>

      <Text style={subtleParagraphStyle}>
        Si tienes dudas mientras trabajamos, puedes revisar tu portal en cualquier momento.
      </Text>
    </EmailLayout>
  );
}
