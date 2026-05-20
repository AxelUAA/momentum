import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  buttonStyle,
  cardStyle,
  heading1Style,
  labelStyle,
  paragraphStyle,
  secondaryButtonStyle,
  subtleParagraphStyle,
  valueStyle,
} from "./components/EmailLayout";

interface PaymentConfirmedEmailProps {
  /** Nombre del cliente */
  customerName: string;
  /** Título del evento */
  eventTitle: string;
  /** Fecha del evento (string formateada, ej: "12 de junio de 2026") */
  eventDate: string;
  /** Monto pagado en MXN, ej: "$499 MXN" */
  amount: string;
  /** URL pública de la invitación */
  invitationUrl: string;
  /** URL del dashboard del organizador */
  dashboardUrl: string;
}

export default function PaymentConfirmedEmail({
  customerName,
  eventTitle,
  eventDate,
  amount,
  invitationUrl,
  dashboardUrl,
}: PaymentConfirmedEmailProps) {
  return (
    <EmailLayout preview={`Tu invitación "${eventTitle}" ya está activa`}>
      <Text style={heading1Style}>¡Pago confirmado, {customerName}! 🎉</Text>

      <Text style={paragraphStyle}>
        Recibimos tu pago de <strong>{amount}</strong> y tu invitación digital
        para <strong>{eventTitle}</strong> ya está activa.
      </Text>

      <Section style={cardStyle}>
        <Text style={labelStyle}>Tu invitación</Text>
        <Text style={valueStyle}>{eventTitle}</Text>
        <Text style={{ ...subtleParagraphStyle, margin: "4px 0 0 0" }}>
          {eventDate}
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button href={invitationUrl} style={buttonStyle}>
          Ver mi invitación
        </Button>
      </Section>

      <Text style={heading1Style}>¿Qué sigue?</Text>

      <Text style={paragraphStyle}>
        Para que todo esté listo el día de tu evento, te recomendamos hacer estas
        tareas en tu panel:
      </Text>

      <Section style={cardStyle}>
        <Text style={{ ...paragraphStyle, margin: "0 0 12px 0" }}>
          <strong>1. Agrega a tus invitados</strong>
          <br />
          <span style={{ color: "#5A6373", fontSize: "14px" }}>
            Sube la lista o pégala desde un CSV. Cada invitado recibe un link
            único para confirmar.
          </span>
        </Text>
        <Text style={{ ...paragraphStyle, margin: "0 0 12px 0" }}>
          <strong>2. Personaliza tu invitación</strong>
          <br />
          <span style={{ color: "#5A6373", fontSize: "14px" }}>
            Sube fotos, agrega tu historia, define código de vestimenta y mesa
            de regalos.
          </span>
        </Text>
        <Text style={{ ...paragraphStyle, margin: "0 0 12px 0" }}>
          <strong>3. Envía la invitación</strong>
          <br />
          <span style={{ color: "#5A6373", fontSize: "14px" }}>
            Usa el generador de WhatsApp para mandar mensajes personalizados a
            tus invitados con un solo click.
          </span>
        </Text>
        <Text style={{ ...paragraphStyle, margin: "0" }}>
          <strong>4. Monitorea las confirmaciones</strong>
          <br />
          <span style={{ color: "#5A6373", fontSize: "14px" }}>
            Cada vez que alguien responda, te avisamos por correo.
          </span>
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button href={dashboardUrl} style={secondaryButtonStyle}>
          Ir a mi panel
        </Button>
      </Section>

      <Text style={subtleParagraphStyle}>
        Tu invitación estará activa hasta 60 días después de la fecha del
        evento. Si necesitas algo, simplemente responde este correo y te
        ayudamos.
      </Text>
    </EmailLayout>
  );
}
