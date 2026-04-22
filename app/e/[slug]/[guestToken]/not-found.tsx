import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFoundInvitation() {
  return (
    <div className="bg-[#0F1B2D] min-h-screen flex flex-col items-center justify-center p-4 text-center selection:bg-[var(--color-champagne)] selection:text-[#0F1B2D]">
      <div className="w-24 h-24 mb-8 text-[var(--color-champagne)] opacity-80 mx-auto">
        <SearchX className="w-full h-full" strokeWidth={1} />
      </div>
      
      <h1 className="font-serif text-5xl md:text-7xl text-[#F4E3C5] mb-6 italic">
        Invitación no encontrada
      </h1>
      
      <p className="font-sans text-[#F4E3C5]/70 max-w-md mx-auto leading-relaxed mb-10 text-lg">
        No pudimos encontrar esta invitación. Verifica que el enlace que recibiste esté completo o contacta a los anfitriones del evento.
      </p>

      <Link 
        href="/"
        className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[var(--color-champagne)] text-[#0F1B2D] font-medium hover:bg-[#F4E3C5] transition-colors shadow-[0_0_20px_rgba(212,175,122,0.15)] tracking-wide uppercase text-sm"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
