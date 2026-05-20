import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  buttonStyle,
  cardStyle,
  heading1Style,
  paragraphStyle,
  subtleParagraphStyle,
} from "./components/EmailLayout";

interface ReadyForReviewEmailProps {
  eventName: string;
  invitationUrl: string;
  portalUrl: string;
}

export default function ReadyForReviewEmail({ eventName, invitationUrl, portalUrl }: ReadyForReviewEmailProps) {
  return (
    <EmailLayout preview="¡Tu invitación está lista! 🎉 Revísala ahora">
      <Text style={heading1Style}>Tu invitación está lista 🎉</Text>

      <Text style={paragraphStyle}>
        Hemos terminado el diseño inicial de tu invitación para <strong>{eventName}</strong>. ¡Ya puedes ver el preview interactivo!
      </Text>

      <Section style={cardStyle}>
        <Text style={{ ...paragraphStyle, margin: "0" }}>
          Por favor, revisa detalladamente toda la información, incluyendo fechas, ubicaciones y textos. Si encuentras algo que necesitas ajustar, podrás solicitar cambios directamente desde tu portal.
        </Text>
      </Section>

      <Section style={{ textAlign: "center" as const, margin: "28px 0" }}>
        <Button href={invitationUrl} style={buttonStyle}>
          Ver mi invitación ✨
        </Button>
        <br /><br />
        <Button href={portalUrl} style={{ ...buttonStyle, backgroundColor: "#E5E7EB", color: "#374151" }}>
          Ver progreso
        </Button>
      </Section>

      <Text style={subtleParagraphStyle}>
        Recuerda que si todo está perfecto, puedes aprobarla desde tu portal para que pase a estado activo y puedas compartirla con tus invitados.
      </Text>
    </EmailLayout>
  );
}
