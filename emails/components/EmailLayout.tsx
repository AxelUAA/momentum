import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Text style={brandStyle}>Momentum</Text>
            <Text style={taglineStyle}>Invitaciones digitales premium</Text>
          </Section>
          <Hr style={hrStyle} />
          <Section style={contentStyle}>{children}</Section>
          <Hr style={hrStyle} />
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Momentum · Invitaciones digitales premium
            </Text>
            <Text style={footerTextStyle}>
              <Link href="https://momentum-alpha-six.vercel.app" style={linkStyle}>
                momentum.mx
              </Link>
              {" · "}
              <Link
                href="https://momentum-alpha-six.vercel.app/dashboard"
                style={linkStyle}
              >
                Tu panel
              </Link>
            </Text>
            <Text style={footerLegalStyle}>
              Si tienes cualquier duda, simplemente responde a este correo.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ─── Estilos inline (los emails NO soportan CSS externo confiablemente) ── */

const bodyStyle = {
  backgroundColor: "#FAF7F2",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const containerStyle = {
  backgroundColor: "#FFFFFF",
  margin: "40px auto",
  padding: "0",
  maxWidth: "560px",
  borderRadius: "12px",
  overflow: "hidden" as const,
  boxShadow: "0 2px 8px rgba(15, 27, 45, 0.06)",
};

const headerStyle = {
  padding: "32px 40px 16px 40px",
  textAlign: "center" as const,
};

const brandStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: "32px",
  fontWeight: "700",
  color: "#0F1B2D",
  margin: "0",
  letterSpacing: "-0.02em",
};

const taglineStyle = {
  fontSize: "11px",
  color: "#5A6373",
  textTransform: "uppercase" as const,
  letterSpacing: "0.15em",
  margin: "8px 0 0 0",
};

const hrStyle = {
  borderColor: "#E8E2D5",
  margin: "0 40px",
};

const contentStyle = {
  padding: "32px 40px",
};

const footerStyle = {
  padding: "24px 40px 32px 40px",
  textAlign: "center" as const,
};

const footerTextStyle = {
  fontSize: "12px",
  color: "#5A6373",
  margin: "4px 0",
};

const footerLegalStyle = {
  fontSize: "11px",
  color: "#8A9AB5",
  margin: "16px 0 0 0",
  fontStyle: "italic" as const,
};

const linkStyle = {
  color: "#0F1B2D",
  textDecoration: "underline",
};

/* ─── Estilos reutilizables exportados para los templates ─────────────── */

export const heading1Style = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: "26px",
  fontWeight: "700",
  color: "#0F1B2D",
  margin: "0 0 16px 0",
  letterSpacing: "-0.01em",
};

export const paragraphStyle = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#0F1B2D",
  margin: "0 0 16px 0",
};

export const subtleParagraphStyle = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#5A6373",
  margin: "0 0 16px 0",
};

export const buttonStyle = {
  backgroundColor: "#0F1B2D",
  color: "#FFFFFF",
  padding: "14px 28px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "700" as const,
  textDecoration: "none",
  display: "inline-block",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

export const secondaryButtonStyle = {
  backgroundColor: "#FFFFFF",
  color: "#0F1B2D",
  padding: "14px 28px",
  borderRadius: "8px",
  border: "1px solid #E8E2D5",
  fontSize: "14px",
  fontWeight: "700" as const,
  textDecoration: "none",
  display: "inline-block",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

export const cardStyle = {
  backgroundColor: "#FAF7F2",
  border: "1px solid #E8E2D5",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
};

export const labelStyle = {
  fontSize: "11px",
  color: "#5A6373",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  margin: "0 0 4px 0",
  fontWeight: "600" as const,
};

export const valueStyle = {
  fontSize: "16px",
  color: "#0F1B2D",
  margin: "0",
  fontWeight: "600" as const,
};
