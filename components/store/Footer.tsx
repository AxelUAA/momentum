import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { WHATSAPP_PHONE } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-heading text-2xl uppercase tracking-wide">
              {BRAND.name}<span className="text-accent">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Vapes premium, sabores reales. Pide por WhatsApp y recibe donde
              estés.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Tienda
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/productos"
                  className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Catálogo completo
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?categoria=desechables"
                  className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Desechables
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?categoria=pods-recargables"
                  className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Pods recargables
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Contacto
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground">ADVERTENCIA:</span> este
            producto contiene nicotina. La nicotina es una sustancia química
            adictiva. Venta exclusiva para mayores de 18 años.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {BRAND.name}. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
