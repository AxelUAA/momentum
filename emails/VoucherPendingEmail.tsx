import { Section, Text } from "@react-email/components";
import {
  EmailLayout,
  cardStyle,
  heading1Style,
  labelStyle,
  paragraphStyle,
  subtleParagraphStyle,
  valueStyle,
} from "./components/EmailLayout";

interface VoucherPendingEmailProps {
  /** Nombre del cliente */
  customerName: string;
  /** Título del evento */
  eventTitle: string;
  /** Monto a pagar, ej: "$499 MXN" */
  amount: string;
  /** Método de pago: "OXXO" o "SPEI" */
  method: "OXXO" | "SPEI";
  /** Referencia (folio OXXO o CLABE SPEI). Puede ser null si Stripe no la dio */
  reference: string | null;
  /** Fecha de expiración del voucher (string formateada) */
  expiresAt: string | null;
}

export default function VoucherPendingEmail({
  customerName,
  eventTitle,
  amount,
  method,
  reference,
  expiresAt,
}: VoucherPendingEmailProps) {
  const isOxxo = method === "OXXO";

  return (
    <EmailLayout
      preview={`Tu ficha de pago ${method} para "${eventTitle}" está lista`}
    >
      <Text style={heading1Style}>
        Tu ficha {method} está lista, {customerName}
      </Text>

      <Text style={paragraphStyle}>
        Recibimos tu orden para <strong>{eventTitle}</strong>. Para activar tu
        invitación, completa el pago con la siguiente referencia:
      </Text>

      <Section style={cardStyle}>
        <Text style={labelStyle}>Monto a pagar</Text>
        <Text style={valueStyle}>{amount}</Text>
      </Section>

      {reference ? (
        <Section style={cardStyle}>
          <Text style={labelStyle}>
            {isOxxo ? "Referencia OXXO" : "CLABE para transferencia SPEI"}
          </Text>
          <Text
            style={{
              ...valueStyle,
              fontFamily: "Menlo, Monaco, Consolas, monospace",
              fontSize: "20px",
              wordBreak: "break-all",
            }}
          >
            {reference}
          </Text>
        </Section>
      ) : (
        <Text style={subtleParagraphStyle}>
          La referencia exacta te llegó también en el correo de Stripe. Si no
          la encuentras, responde a este correo y te ayudamos.
        </Text>
      )}

      {expiresAt ? (
        <Section style={{ ...cardStyle, backgroundColor: "#FFF8E6", borderColor: "#F0DBA8" }}>
          <Text style={labelStyle}>Vence el</Text>
          <Text style={valueStyle}>{expiresAt}</Text>
          <Text style={{ ...subtleParagraphStyle, margin: "8px 0 0 0" }}>
            Si no pagas antes de esa fecha, tendrás que generar una nueva ficha.
          </Text>
        </Section>
      ) : null}

      <Text style={heading1Style}>¿Cómo pagar?</Text>

      {isOxxo ? (
        <Text style={paragraphStyle}>
          1. Acude a cualquier tienda OXXO con la referencia de arriba.
          <br />
          2. Indica al cajero que vas a pagar un servicio.
          <br />
          3. Muestra la referencia (puedes mostrarle este correo).
          <br />
          4. Paga el monto exacto.
          <br />
          5. Guarda tu ticket como comprobante.
        </Text>
      ) : (
        <Text style={paragraphStyle}>
          1. Entra a tu app bancaria.
          <br />
          2. Ve a la sección de transferencias SPEI.
          <br />
          3. Captura la CLABE de arriba como cuenta destino.
          <br />
          4. Banco destino: <strong>STP</strong>.
          <br />
          5. Beneficiario: <strong>Stripe Payments Mexico</strong>.
          <br />
          6. Transfiere el monto exacto.
        </Text>
      )}

      <Text style={subtleParagraphStyle}>
        Una vez que el pago se procese (puede tardar de unos minutos hasta 3
        días hábiles para SPEI), te enviaremos otro correo confirmando que tu
        invitación ya está activa.
      </Text>
    </EmailLayout>
  );
}
