import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Momentum",
  description:
    "Términos y condiciones de uso del servicio de invitaciones digitales Momentum.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "27 de abril de 2026";
const CONTACT_EMAIL = "axelinm11@gmail.com";

export default function TerminosPage() {
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
            Términos y Condiciones
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Última actualización: {LAST_UPDATED}
          </p>
        </header>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">1. Aceptación de los términos</h2>
            <p className="leading-relaxed text-muted-foreground">
              Al acceder o utilizar Momentum (en adelante, &quot;la
              Plataforma&quot;), operada por Axel Murillo Lopez (en adelante,
              &quot;Momentum&quot;, &quot;nosotros&quot; o &quot;nuestro&quot;),
              usted (en adelante, el &quot;Usuario&quot;) acepta quedar
              vinculado por los presentes Términos y Condiciones. Si no está
              de acuerdo con cualquier disposición, deberá abstenerse de
              utilizar la Plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">2. Descripción del servicio</h2>
            <p className="leading-relaxed text-muted-foreground">
              Momentum es una plataforma digital que permite a los Usuarios
              crear, personalizar, publicar y administrar invitaciones
              digitales para eventos sociales y corporativos, incluyendo
              bodas, XV años, bautizos, cumpleaños, baby showers, graduaciones
              y eventos corporativos. El servicio se presta en modalidad SaaS
              y se entrega como una página web única accesible mediante un
              enlace personalizado.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">3. Registro y cuenta</h2>
            <p className="leading-relaxed text-muted-foreground">
              Para utilizar la Plataforma, el Usuario debe crear una cuenta
              proporcionando información veraz, completa y actualizada. El
              Usuario es responsable de mantener la confidencialidad de sus
              credenciales de acceso y de toda actividad que ocurra bajo su
              cuenta. Momentum se reserva el derecho de suspender o eliminar
              cuentas que infrinjan estos Términos o que sean usadas con fines
              fraudulentos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">4. Planes y pagos</h2>
            <p className="leading-relaxed text-muted-foreground">
              Momentum ofrece dos modalidades de cobro:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>Pago único por invitación:</strong> el Usuario paga una
                sola vez por una invitación digital que permanece activa hasta
                60 días posteriores a la fecha del evento.
              </li>
              <li>
                <strong>Suscripción mensual:</strong> el Usuario paga una cuota
                recurrente que permite la creación de un número limitado de
                invitaciones activas durante el periodo de suscripción.
              </li>
            </ul>
            <p className="leading-relaxed text-muted-foreground">
              Los precios están expresados en pesos mexicanos (MXN) y los
              cobros son procesados a través de Stripe Payments Mexico S. de
              R.L. de C.V. Aceptamos tarjeta de crédito, débito, OXXO Pay y
              transferencia bancaria SPEI.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">5. Renovación y cancelación de suscripciones</h2>
            <p className="leading-relaxed text-muted-foreground">
              Las suscripciones se renuevan automáticamente al final de cada
              ciclo de facturación, salvo que el Usuario las cancele
              previamente desde el portal de cliente accesible en su panel.
              La cancelación toma efecto al final del periodo facturado en
              curso; el Usuario conserva el acceso a las funciones del plan
              hasta esa fecha. No se realizan reembolsos prorrateados por
              cancelación voluntaria a media marcha del ciclo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">6. Propiedad intelectual</h2>
            <p className="leading-relaxed text-muted-foreground">
              Todos los derechos de propiedad intelectual sobre el código,
              diseño, plantillas y elementos gráficos de la Plataforma
              pertenecen a Momentum. El Usuario conserva todos los derechos
              sobre el contenido que sube (textos, fotografías, listas de
              invitados), pero otorga a Momentum una licencia no exclusiva,
              gratuita y limitada para almacenar, procesar y mostrar dicho
              contenido con el fin exclusivo de prestar el servicio. El
              Usuario declara y garantiza que cuenta con los derechos
              necesarios sobre el contenido que publica.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">7. Uso permitido</h2>
            <p className="leading-relaxed text-muted-foreground">
              El Usuario se compromete a no utilizar la Plataforma para fines
              ilegales, fraudulentos o que vulneren derechos de terceros. En
              particular, queda prohibido publicar contenido que sea ofensivo,
              difamatorio, discriminatorio, sexualmente explícito, violento o
              que infrinja derechos de propiedad intelectual de terceros.
              Momentum se reserva el derecho de retirar contenido y suspender
              cuentas que infrinjan estas reglas, sin previo aviso ni
              reembolso.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">8. Disponibilidad y soporte</h2>
            <p className="leading-relaxed text-muted-foreground">
              Momentum se esfuerza por mantener la Plataforma disponible 24/7,
              pero no garantiza una disponibilidad ininterrumpida. Pueden
              presentarse interrupciones temporales por mantenimiento,
              actualizaciones o causas de fuerza mayor. El soporte se presta
              vía correo electrónico a {CONTACT_EMAIL} con tiempo de respuesta
              razonable durante días hábiles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">9. Limitación de responsabilidad</h2>
            <p className="leading-relaxed text-muted-foreground">
              Momentum no será responsable por daños indirectos, lucro cesante
              o consecuenciales derivados del uso o imposibilidad de uso de la
              Plataforma. La responsabilidad total acumulada de Momentum frente
              al Usuario, por cualquier concepto, no excederá el monto pagado
              por el Usuario en los 12 meses previos al hecho que dio origen a
              la reclamación.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">10. Modificaciones</h2>
            <p className="leading-relaxed text-muted-foreground">
              Momentum podrá modificar estos Términos en cualquier momento. Las
              modificaciones surten efecto desde su publicación en esta página.
              Para cambios materiales, notificaremos por correo electrónico al
              Usuario con al menos 15 días de anticipación. El uso continuado
              de la Plataforma tras la entrada en vigor de modificaciones
              constituye aceptación de las mismas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">11. Legislación aplicable</h2>
            <p className="leading-relaxed text-muted-foreground">
              Los presentes Términos se rigen por las leyes de los Estados
              Unidos Mexicanos. Para cualquier controversia, las partes se
              someten a la jurisdicción de los tribunales competentes de la
              Ciudad de México, renunciando a cualquier otro fuero que pudiera
              corresponderles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">12. Contacto</h2>
            <p className="leading-relaxed text-muted-foreground">
              Para cualquier duda sobre estos Términos, escribe a{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        <footer className="mt-16 flex items-center justify-between border-t border-border pt-8 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
          <div className="flex gap-4 text-muted-foreground">
            <Link href="/privacidad" className="hover:text-foreground">
              Privacidad
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
