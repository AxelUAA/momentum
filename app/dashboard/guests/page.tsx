import { prisma } from "@/lib/prisma";
import { Users, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Gestión de Invitados | Momentum",
};

export default async function GuestsGlobalPage() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { guests: true }
      }
    }
  });

  return (
    <div className="space-y-8 p-6 md:p-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight">Gestión de Invitados</h1>
        <p className="mt-2 text-[var(--color-midnight)]/70">
          Selecciona un evento para gestionar su lista de invitados, RSVPs y mensajes.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-black/5 bg-white/50 p-8 text-center shadow-sm">
          <div className="mb-6 rounded-full bg-[var(--color-midnight)]/5 p-6">
            <Calendar className="h-12 w-12 text-[var(--color-midnight)]/40" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-midnight)]">
            No tienes eventos activos
          </h2>
          <p className="mt-2 max-w-md text-[var(--color-midnight)]/60">
            Primero debes crear un evento para poder gestionar sus invitados.
          </p>
          <Link href="/dashboard/events/new" className={cn(buttonVariants({ variant: "default" }), "mt-6 rounded-xl")}>
            Crear mi primer evento
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div 
              key={event.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="h-24 w-24 text-[var(--color-midnight)]" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-midnight)]/5 text-[var(--color-midnight)] group-hover:bg-[var(--color-brand)] group-hover:text-[var(--color-midnight)] transition-colors">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-midnight)] line-clamp-1">{event.title}</h3>
                <p className="text-sm text-[var(--color-midnight)]/60 font-mono mb-6">/e/{event.slug}</p>
                
                <div className="flex items-center gap-4 border-t border-black/5 pt-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Invitados</p>
                    <p className="text-2xl font-black text-[var(--color-midnight)]">{event._count.guests}</p>
                  </div>
                  <div className="flex-1 border-l border-black/5 pl-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo</p>
                    <p className="text-sm font-bold uppercase tracking-tighter text-[var(--color-brand)]">{event.type}</p>
                  </div>
                </div>
              </div>

              <Link 
                href={`/dashboard/events/${event.id}/guests`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "mt-8 w-full gap-2 rounded-2xl bg-[var(--color-midnight)] text-[var(--color-cream)] hover:bg-[var(--color-midnight)]/90"
                )}
              >
                Gestionar Lista
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
