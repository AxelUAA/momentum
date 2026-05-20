import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  buttonStyle,
  cardStyle,
  heading1Style,
  paragraphStyle,
  subtleParagraphStyle,
} from "./components/EmailLayout";

interface IntakeReceivedEmailProps {
  eventName: string;
  portalUrl: string;
}

export default function IntakeReceivedEmail({ eventName, portalUrl }: IntakeReceivedEmailProps) {
  return (
    <EmailLayout preview="Recibimos todo — estamos construyendo tu invitación ✨">
      <Text style={heading1Style}>Recibimos tu información 📝</Text>

      <Text style={paragraphStyle}>
        ¡Gracias! Hemos recibido exitosamente todos los datos para <strong>{eventName}</strong>.
      </Text>

      <Section style={cardStyle}>
        <Text style={{ ...paragraphStyle, margin: "0 0 10px 0" }}>
          🚀 <strong>¿Qué sigue ahora?</strong>
        </Text>
        <Text style={{ ...paragraphStyle, margin: "0" }}>
          Nuestro equipo revisará tu información y comenzará a armar el diseño de tu invitación. Este proceso suele tomar <strong>entre 2 y 3 días hábiles</strong>.
        </Text>
      </Section>

      <Section style={{ textAlign: "center" as const, margin: "28px 0" }}>
        <Button href={portalUrl} style={buttonStyle}>
          Ver mi progreso →
        </Button>
      </Section>

      <Text style={subtleParagraphStyle}>
        Te enviaremos otro correo en cuanto comencemos a trabajar en tu diseño y cuando esté listo para tu revisión.
      </Text>
    </EmailLayout>
  );
}
