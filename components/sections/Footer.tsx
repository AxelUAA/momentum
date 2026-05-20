import Link from "next/link";
import { Logo } from "@/components/ui/Logo";


export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/" aria-label="Momentum Home" className="inline-block text-2xl">
              <Logo variant="onLight" className="dark:hidden" />
              <Logo variant="mono-light" className="hidden dark:flex" />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              Transformando la manera en que celebramos en México y LATAM. Invitaciones digitales premium, sin fricciones.
            </p>
          </div>

          {/* Producto */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Producto</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="#templates" className="hover:text-[var(--color-champagne)] transition-colors">Plantillas</Link>
              <Link href="#pricing" className="hover:text-[var(--color-champagne)] transition-colors">Precios</Link>
              <Link href="#how-it-works" className="hover:text-[var(--color-champagne)] transition-colors">Características</Link>
              <Link href="/login" className="hover:text-[var(--color-champagne)] transition-colors">Crear invitación</Link>
            </nav>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Contacto</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ¿Dudas? Escríbenos a{" "}
              <a
                href="mailto:axelinm11@gmail.com"
                className="hover:text-[var(--color-champagne)] transition-colors"
              >
                hola@momentum.mx
              </a>
            </p>
          </div>

          {/* Legal & Redes */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Legal & Redes</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/terminos" className="hover:text-[var(--color-champagne)] transition-colors">Términos y condiciones</Link>
              <Link href="/privacidad" className="hover:text-[var(--color-champagne)] transition-colors">Aviso de privacidad</Link>
              <Link href="/reembolso" className="hover:text-[var(--color-champagne)] transition-colors">Política de reembolso</Link>
              <Link href="/cookies" className="hover:text-[var(--color-champagne)] transition-colors">Política de cookies</Link>
              <div className="mt-4 flex gap-4">
                <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-[var(--color-champagne)] transition-colors">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </a>
                <a href="#" aria-label="TikTok" className="text-muted-foreground hover:text-[var(--color-champagne)] transition-colors">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z" />
                  </svg>
                </a>
                <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-[var(--color-champagne)] transition-colors">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
              </div>
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Momentum. Todos los derechos reservados.</p>
          <p>Axel Murillo Lopez | Desarrollador Web</p>
        </div>
      </div>
    </footer>
  );
}
