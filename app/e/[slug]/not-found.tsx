import { Search } from "lucide-react";

export const metadata = {
  title: "Invitación no disponible | Momentum",
};

export default function EventNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="mx-auto flex max-w-md flex-col items-center text-center px-4">
        {/* Momentum Logo */}
        <div className="mb-8 font-serif text-3xl font-bold text-[var(--color-champagne)] tracking-widest uppercase">
          Momentum
        </div>
        
        <div className="mb-8 rounded-full bg-[var(--color-muted)] p-6">
          <Search className="h-12 w-12 text-[var(--color-champagne)]" />
        </div>
        
        <h1 
          className="mb-4 text-3xl font-bold tracking-tight text-[var(--color-foreground)] font-serif md:text-4xl"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          Esta invitación no está disponible
        </h1>
        
        <p className="mb-8 text-base text-[var(--color-muted-foreground)]">
          Es posible que el enlace sea incorrecto, que la invitación haya expirado o que el evento haya concluido.
        </p>
      </div>
    </div>
  );
}
