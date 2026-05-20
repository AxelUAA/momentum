import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Users, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de Invitados | Momentum",
};

export default async function GuestsGlobalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";
  const where = isAdmin ? {} : { userId: session.user.id };

  const events = await prisma.event.findMany({
    where,
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
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Invitados</h1>
        <p className="mt-2 text-muted-foreground">
          Selecciona un evento para gestionar su lista de invitados, RSVPs y mensajes.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-card-foreground shadow-sm">
          <div className="mb-6 rounded-full bg-muted p-6">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">
            No tienes eventos activos
          </h2>
          <p className="mt-2 max-w-md text-muted-foreground">
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
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="h-24 w-24 text-foreground" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-foreground transition-colors group-hover:bg-[var(--color-brand)] group-hover:text-[var(--color-midnight)]">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="line-clamp-1 text-xl font-bold">{event.title}</h3>
                <p className="mb-6 font-mono text-sm text-muted-foreground">/e/{event.slug}</p>
                
                <div className="flex items-center gap-4 border-t border-border pt-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Invitados</p>
                    <p className="text-2xl font-black">{event._count.guests}</p>
                  </div>
                  <div className="flex-1 border-l border-border pl-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo</p>
                    <p className="text-sm font-bold uppercase tracking-tighter text-[var(--color-brand)]">{event.type}</p>
                  </div>
                </div>
              </div>

              <Link 
                href={`/dashboard/events/${event.id}/guests`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "mt-8 w-full gap-2 rounded-2xl"
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
