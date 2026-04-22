import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/" className="font-heading text-3xl font-semibold tracking-tight text-foreground">
              Momentum
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

          {/* Empresa */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Empresa</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-[var(--color-champagne)] transition-colors">Nosotros</Link>
              <Link href="#" className="hover:text-[var(--color-champagne)] transition-colors">Blog</Link>
              <Link href="#" className="hover:text-[var(--color-champagne)] transition-colors">Contacto</Link>
              <Link href="#" className="hover:text-[var(--color-champagne)] transition-colors">Partners</Link>
            </nav>
          </div>

          {/* Legal & Redes */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Legal & Redes</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-[var(--color-champagne)] transition-colors">Términos de servicio</Link>
              <Link href="#" className="hover:text-[var(--color-champagne)] transition-colors">Privacidad</Link>
              <div className="mt-4 flex gap-4">
                {/* Social placeholders */}
                <a href="#" className="text-muted-foreground hover:text-[var(--color-champagne)] transition-colors">IG</a>
                <a href="#" className="text-muted-foreground hover:text-[var(--color-champagne)] transition-colors">TK</a>
                <a href="#" className="text-muted-foreground hover:text-[var(--color-champagne)] transition-colors">FB</a>
              </div>
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Momentum. Todos los derechos reservados.</p>
          <p>Hecho con ♥️ en México</p>
        </div>
      </div>
    </footer>
  );
}
