import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  buttonStyle,
  cardStyle,
  heading1Style,
  paragraphStyle,
  subtleParagraphStyle,
} from "./components/EmailLayout";

interface ChangesRequestedEmailProps {
  eventName: string;
  portalUrl: string;
}

export default function ChangesRequestedEmail({ eventName, portalUrl }: ChangesRequestedEmailProps) {
  return (
    <EmailLayout preview="Necesitamos un ajuste para tu invitación">
      <Text style={heading1Style}>Necesitamos algo de ti ⚠️</Text>

      <Text style={paragraphStyle}>
        El equipo ha revisado tu invitación para <strong>{eventName}</strong> y necesitamos que realices algunos ajustes o apruebes ciertas modificaciones para poder continuar.
      </Text>

      <Section style={cardStyle}>
        <Text style={{ ...paragraphStyle, margin: "0" }}>
          Hemos dejado notas detalladas en tu portal. Por favor, revísalas y contesta lo antes posible para evitar demoras en la entrega de tu invitación final.
        </Text>
      </Section>

      <Section style={{ textAlign: "center" as const, margin: "28px 0" }}>
        <Button href={portalUrl} style={buttonStyle}>
          Ver qué se necesita →
        </Button>
      </Section>

      <Text style={subtleParagraphStyle}>
        Estamos aquí para ayudarte. Si tienes alguna duda sobre los cambios solicitados, puedes dejarnos una nota en el mismo portal.
      </Text>
    </EmailLayout>
  );
}
