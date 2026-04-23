import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Acceso Denegado | Momentum",
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-midnight)] text-[var(--color-cream)]">
      <div className="mx-auto flex max-w-md flex-col items-center text-center px-4">
        <div className="mb-8 rounded-full bg-white/5 p-6">
          <ShieldAlert className="h-16 w-16 text-[var(--color-champagne)]" />
        </div>
        
        <h1 
          className="mb-4 text-4xl font-bold tracking-tight text-[var(--color-cream)] font-serif md:text-5xl"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          Esta zona es privada
        </h1>
        
        <p className="mb-8 text-lg text-white/70">
          Solo administradores de Momentum pueden acceder al panel. Si crees que deberías tener acceso, contáctanos.
        </p>
        
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-champagne)] px-8 text-sm font-medium text-[var(--color-midnight)] transition-all hover:bg-[var(--color-champagne)]/90"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
