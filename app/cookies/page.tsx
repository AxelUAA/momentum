import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies | Momentum",
  description:
    "Política de uso de cookies y tecnologías similares en Momentum.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "27 de abril de 2026";

export default function CookiesPage() {
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
            Política de Cookies
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Última actualización: {LAST_UPDATED}
          </p>
        </header>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">1. ¿Qué son las cookies?</h2>
            <p className="leading-relaxed text-muted-foreground">
              Las cookies son pequeños archivos de texto que se almacenan en
              tu navegador cuando visitas un sitio web. Permiten reconocer
              al usuario en visitas posteriores y mejorar la experiencia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">2. Cookies que usamos</h2>
            <p className="leading-relaxed text-muted-foreground">
              Momentum utiliza únicamente cookies estrictamente necesarias.
              No usamos cookies de publicidad ni de seguimiento de terceros.
            </p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-4 font-semibold">Cookie</th>
                  <th className="py-3 pr-4 font-semibold">Origen</th>
                  <th className="py-3 font-semibold">Finalidad</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 font-mono text-xs">
                    next-auth.session-token
                  </td>
                  <td className="py-3 pr-4">Momentum</td>
                  <td className="py-3">
                    Mantiene la sesión iniciada del usuario.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 font-mono text-xs">
                    next-auth.callback-url
                  </td>
                  <td className="py-3 pr-4">Momentum</td>
                  <td className="py-3">
                    Recordar a dónde redirigir tras login.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 font-mono text-xs">
                    __stripe_*
                  </td>
                  <td className="py-3 pr-4">Stripe</td>
                  <td className="py-3">
                    Procesar pagos y prevenir fraudes durante el checkout.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs">theme</td>
                  <td className="py-3 pr-4">Momentum</td>
                  <td className="py-3">
                    Recordar la preferencia de tema (claro/oscuro).
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">3. Datos de uso anónimos</h2>
            <p className="leading-relaxed text-muted-foreground">
              Cuando un invitado abre una invitación pública, registramos un
              hash anonimizado de su dirección IP y el agente de navegador
              para fines estadísticos del organizador (número de visitas a la
              invitación). Estos datos no permiten identificar individualmente
              al visitante.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">4. Cómo desactivar cookies</h2>
            <p className="leading-relaxed text-muted-foreground">
              Puedes configurar tu navegador para rechazar o eliminar cookies.
              Sin embargo, si rechazas las cookies estrictamente necesarias,
              algunas funciones de la Plataforma (como mantener la sesión
              iniciada o procesar pagos) dejarán de funcionar correctamente.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Instrucciones por navegador:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>Chrome:</strong> Configuración → Privacidad y
                seguridad → Cookies y otros datos de sitios.
              </li>
              <li>
                <strong>Firefox:</strong> Ajustes → Privacidad y seguridad
                → Cookies y datos del sitio.
              </li>
              <li>
                <strong>Safari:</strong> Preferencias → Privacidad → Cookies y
                datos de sitios web.
              </li>
            </ul>
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
            <Link href="/reembolso" className="hover:text-foreground">
              Reembolso
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}
