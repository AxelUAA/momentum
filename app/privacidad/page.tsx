import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | Momentum",
  description:
    "Aviso de privacidad de Momentum conforme a la LFPDPPP, sobre el tratamiento de datos personales.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "27 de abril de 2026";
const CONTACT_EMAIL = "axelinm11@gmail.com";

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <article className="mx-auto max-w-3xl">
        <header className="mb-12 border-b border-border pb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Documento legal · LFPDPPP
          </p>
          <h1
            className="mt-3 text-4xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Aviso de Privacidad
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Última actualización: {LAST_UPDATED}
          </p>
        </header>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">1. Identidad del responsable</h2>
            <p className="leading-relaxed text-muted-foreground">
              El responsable del tratamiento de sus datos personales es Axel
              Murillo Lopez, titular del proyecto Momentum, con domicilio en
              los Estados Unidos Mexicanos y correo electrónico de contacto{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">2. Datos personales que recabamos</h2>
            <p className="leading-relaxed text-muted-foreground">
              Tratamos los siguientes datos personales:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>Datos de identificación:</strong> nombre, correo
                electrónico, número telefónico (opcional).
              </li>
              <li>
                <strong>Datos de facturación:</strong> nombre, RFC, correo
                electrónico (cuando aplique).
              </li>
              <li>
                <strong>Datos de pago:</strong> los procesa directamente
                Stripe; Momentum no almacena ni accede a información de
                tarjetas o cuentas bancarias.
              </li>
              <li>
                <strong>Datos del evento:</strong> título, fecha, ubicación,
                lista de invitados, fotografías y demás contenido que el
                Usuario suba.
              </li>
              <li>
                <strong>Datos de invitados:</strong> nombre, correo
                electrónico, teléfono y restricciones alimentarias, cuando el
                organizador los proporcione.
              </li>
              <li>
                <strong>Datos de uso:</strong> dirección IP (hasheada), tipo
                de navegador y momentos de visualización de la invitación.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">3. Finalidades del tratamiento</h2>
            <p className="leading-relaxed text-muted-foreground">
              Tratamos los datos personales con las siguientes finalidades
              primarias:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>Crear y gestionar tu cuenta en la Plataforma.</li>
              <li>Permitirte crear, publicar y administrar tus invitaciones.</li>
              <li>Procesar pagos y emitir comprobantes.</li>
              <li>Enviar notificaciones operativas (confirmaciones de pago, RSVPs recibidos).</li>
              <li>Brindar soporte técnico.</li>
              <li>Cumplir con obligaciones fiscales y legales.</li>
            </ul>
            <p className="leading-relaxed text-muted-foreground">
              Finalidades secundarias (puede oponerse):
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>Envío de comunicaciones de marketing sobre nuevas plantillas o promociones.</li>
              <li>Análisis estadístico anónimo para mejorar el producto.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">4. Transferencias de datos</h2>
            <p className="leading-relaxed text-muted-foreground">
              Sus datos pueden ser transferidos a los siguientes terceros
              proveedores de servicios necesarios para la operación de
              Momentum:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>Vercel (hosting):</strong> almacena temporalmente las
                solicitudes a la Plataforma.
              </li>
              <li>
                <strong>Supabase (base de datos y storage):</strong> almacena
                la información de eventos, invitados y archivos subidos.
              </li>
              <li>
                <strong>Stripe Payments Mexico:</strong> procesa pagos.
              </li>
              <li>
                <strong>Resend (emails):</strong> entrega las notificaciones
                por correo electrónico.
              </li>
              <li>
                <strong>Google (autenticación):</strong> usado únicamente si
                el Usuario inicia sesión con Google OAuth.
              </li>
            </ul>
            <p className="leading-relaxed text-muted-foreground">
              Estos proveedores cuentan con cláusulas contractuales que
              garantizan un nivel adecuado de protección, equivalente al
              previsto por la LFPDPPP. No se realizan transferencias con fines
              comerciales sin consentimiento.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">5. Derechos ARCO</h2>
            <p className="leading-relaxed text-muted-foreground">
              Como titular de los datos, tienes derecho a:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>Acceso:</strong> conocer qué datos tenemos sobre ti.
              </li>
              <li>
                <strong>Rectificación:</strong> corregir datos inexactos o
                incompletos.
              </li>
              <li>
                <strong>Cancelación:</strong> solicitar que eliminemos tus
                datos cuando ya no sean necesarios.
              </li>
              <li>
                <strong>Oposición:</strong> oponerte al uso de tus datos para
                fines secundarios.
              </li>
            </ul>
            <p className="leading-relaxed text-muted-foreground">
              Para ejercer estos derechos, envía un correo a{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              indicando claramente cuál derecho deseas ejercer y adjuntando
              identificación oficial. Responderemos en un plazo máximo de 20
              días hábiles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">6. Conservación de datos</h2>
            <p className="leading-relaxed text-muted-foreground">
              Los datos se conservan mientras la cuenta del Usuario esté
              activa. Si solicita eliminación, los borramos en un plazo
              máximo de 30 días, salvo aquellos que estamos obligados a
              conservar por motivos fiscales o legales (registros de pagos
              durante 5 años).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">7. Medidas de seguridad</h2>
            <p className="leading-relaxed text-muted-foreground">
              Implementamos medidas técnicas y administrativas razonables
              para proteger los datos personales: cifrado en tránsito (HTTPS),
              cifrado en reposo a nivel de proveedor, control de acceso por
              rol, autenticación segura y auditorías periódicas. Sin embargo,
              ningún sistema es 100% seguro y el Usuario reconoce este riesgo
              al utilizar la Plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">8. Cookies</h2>
            <p className="leading-relaxed text-muted-foreground">
              Utilizamos cookies estrictamente necesarias para mantener tu
              sesión iniciada y para el funcionamiento del checkout de Stripe.
              Para más detalle, consulta nuestra{" "}
              <Link href="/cookies" className="font-medium underline">
                Política de Cookies
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">9. Modificaciones al aviso</h2>
            <p className="leading-relaxed text-muted-foreground">
              Este Aviso podrá ser modificado. Las modificaciones surten
              efecto desde su publicación. Para cambios materiales,
              notificaremos por correo a los usuarios registrados.
            </p>
          </section>
        </div>

        <footer className="mt-16 flex items-center justify-between border-t border-border pt-8 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
          <div className="flex gap-4 text-muted-foreground">
            <Link href="/terminos" className="hover:text-foreground">
              Términos
            </Link>
            <Link href="/reembolso" className="hover:text-foreground">
              Reembolso
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}
