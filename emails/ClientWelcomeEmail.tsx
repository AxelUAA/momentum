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

interface ClientWelcomeEmailProps {
  clientName: string;
  planName: string;
  amount: string;
  portalUrl: string;
}

export default function ClientWelcomeEmail({
  clientName,
  planName,
  amount,
  portalUrl,
}: ClientWelcomeEmailProps) {
  return (
    <EmailLayout preview={`¡Bienvenido a Momentum! Tu portal de invitación está listo`}>
      <Text style={heading1Style}>¡Hola, {clientName}! 🎉</Text>

      {amount !== "—" ? (
        <Text style={paragraphStyle}>
          Tu pago de <strong>{amount}</strong> fue confirmado. Ya tenemos tu{" "}
          <strong>{planName}</strong> lista para comenzar.
        </Text>
      ) : (
        <Text style={paragraphStyle}>
          Ya tenemos tu cuenta de <strong>{planName}</strong> lista para comenzar.
        </Text>
      )}

      <Text style={paragraphStyle}>
        Hemos creado tu portal personal donde podrás:
      </Text>

      <Section style={cardStyle}>
        <Text style={{ ...paragraphStyle, margin: "0 0 10px 0" }}>
          📋 <strong>Llenar los datos de tu evento</strong>
          <br />
          <span style={{ color: "#5A6373", fontSize: "14px" }}>
            Fecha, lugar, nombres y todo lo que necesitamos para crear tu
            invitación.
          </span>
        </Text>
        <Text style={{ ...paragraphStyle, margin: "0 0 10px 0" }}>
          👁️ <strong>Ver el preview de tu invitación</strong>
          <br />
          <span style={{ color: "#5A6373", fontSize: "14px" }}>
            Una vez que la armemos, podrás revisarla y pedir cambios desde tu
            portal.
          </span>
        </Text>
        <Text style={{ ...paragraphStyle, margin: "0" }}>
          📊 <strong>Monitorear tus confirmaciones</strong>
          <br />
          <span style={{ color: "#5A6373", fontSize: "14px" }}>
            Cuando tu invitación esté activa, verás en tiempo real quién confirmó
            asistencia.
          </span>
        </Text>
      </Section>

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
        <Text style={{ ...subtleParagraphStyle, margin: "8px 0 0 0" }}>
          Guarda este enlace — es tu acceso directo. No necesitas crear una
          cuenta.
        </Text>
      </Section>

      <Text style={subtleParagraphStyle}>
        Nuestro equipo comenzará a trabajar en tu invitación una vez que llenes
        tus datos. Si tienes alguna duda, simplemente responde a este correo.
      </Text>
    </EmailLayout>
  );
}
