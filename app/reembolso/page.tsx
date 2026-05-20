import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Reembolso | Momentum",
  description:
    "Política de reembolso y cancelación de Momentum para invitaciones digitales y suscripciones.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "27 de abril de 2026";
const CONTACT_EMAIL = "axelinm11@gmail.com";

export default function ReembolsoPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <article className="mx-auto max-w-3xl">
        <header className="mb-12 border-b border-border pb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Documento legal
          </p>
          <h1
            className="mt-3 text-4xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Política de Reembolso
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Última actualización: {LAST_UPDATED}
          </p>
        </header>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground">
          <section className="space-y-3">
            <p className="leading-relaxed text-muted-foreground">
              En Momentum entendemos que los planes pueden cambiar.
              Establecemos a continuación las condiciones bajo las cuales
              procesamos reembolsos. Esta política es parte integral de
              nuestros{" "}
              <Link href="/terminos" className="font-medium underline">
                Términos y Condiciones
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">1. Pagos únicos por invitación</h2>
            <p className="leading-relaxed text-muted-foreground">
              Para invitaciones pagadas en modalidad de pago único:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>Reembolso total dentro de los 7 días siguientes
                a la compra,</strong> siempre y cuando la invitación no haya
                sido enviada a invitados (esto se verifica con el registro de
                aperturas y compartidos en nuestro sistema).
              </li>
              <li>
                <strong>No se otorga reembolso</strong> después de que la
                invitación ha sido compartida o vista por al menos un invitado,
                aún si el evento se cancela posteriormente.
              </li>
              <li>
                <strong>No se otorga reembolso</strong> después de la fecha
                del evento.
              </li>
              <li>
                <strong>Excepción por causa de fuerza mayor</strong> (caso
                fortuito, fallecimiento de un titular del evento u otras
                circunstancias graves debidamente comprobadas): evaluamos
                caso por caso y, de proceder, se otorga reembolso total dentro
                de 30 días naturales.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">2. Suscripciones de organizador</h2>
            <p className="leading-relaxed text-muted-foreground">
              Para suscripciones recurrentes (planes Organizador Plus y
              Organizador Pro):
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>Cancelación voluntaria:</strong> puedes cancelar tu
                suscripción en cualquier momento desde el panel de cliente.
                La cancelación toma efecto al final del periodo facturado en
                curso. Conservas el acceso a las funciones del plan hasta esa
                fecha.
              </li>
              <li>
                <strong>No se realizan reembolsos prorrateados</strong> por
                cancelación a media marcha del ciclo de suscripción.
              </li>
              <li>
                <strong>Cobros duplicados o errores de facturación:</strong>{" "}
                se reembolsan al 100% dentro de 5 días hábiles posteriores a
                la verificación. Para reportarlos, escribe a{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium underline"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">3. Defectos del servicio</h2>
            <p className="leading-relaxed text-muted-foreground">
              Si la Plataforma presenta una falla material que impida usar la
              invitación durante un periodo igual o mayor a 24 horas
              continuas dentro del plazo activo de la invitación, podemos
              otorgar:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>Crédito por el tiempo perdido para extender el plazo de la invitación.</li>
              <li>O reembolso parcial proporcional, a discreción del Usuario.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">4. Cómo solicitar un reembolso</h2>
            <p className="leading-relaxed text-muted-foreground">
              Envía un correo a{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              con el asunto &quot;Solicitud de reembolso&quot; e incluye:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>Correo electrónico asociado a tu cuenta.</li>
              <li>Identificador del evento o de la suscripción (visible en tu panel).</li>
              <li>Motivo de la solicitud.</li>
              <li>Comprobante de pago si lo tienes a la mano (no es indispensable).</li>
            </ul>
            <p className="leading-relaxed text-muted-foreground">
              Respondemos dentro de los 3 días hábiles siguientes. Si el
              reembolso procede, se aplica al método de pago original en
              5 a 10 días hábiles dependiendo del banco emisor.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">5. Pagos por OXXO o SPEI</h2>
            <p className="leading-relaxed text-muted-foreground">
              Para pagos realizados por OXXO o SPEI, el reembolso requiere que
              proporciones una CLABE bancaria a tu nombre para realizar la
              transferencia. El plazo de reembolso es de hasta 15 días hábiles
              dependiendo del intermediario.
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
            <Link href="/privacidad" className="hover:text-foreground">
              Privacidad
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
