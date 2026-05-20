import Link from "next/link";
import { Search } from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";

export const metadata = {
  title: "Página no encontrada | Momentum",
};

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-[var(--color-midnight)] text-[var(--color-cream)]">
        <div className="mx-auto flex max-w-md flex-col items-center text-center px-4">
          <div className="mb-8 rounded-full bg-white/5 p-6">
            <Search className="h-16 w-16 text-[var(--color-champagne)]" />
          </div>
          
          <h1 
            className="mb-4 text-4xl font-bold tracking-tight text-[var(--color-cream)] font-serif md:text-5xl"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Esta invitación no existe o ya expiró
          </h1>
          
          <p className="mb-8 text-lg text-white/70">
            No pudimos encontrar la página que buscas. Es posible que el enlace esté roto o que el evento haya concluido.
          </p>
          
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-champagne)] px-8 text-sm font-medium text-[var(--color-midnight)] transition-all hover:bg-[var(--color-champagne)]/90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </>
  );
}
