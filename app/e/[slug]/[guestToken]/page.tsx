import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuroraTemplate } from "@/components/templates/Aurora";

interface PageProps {
  params: Promise<{
    slug: string;
    guestToken: string;
  }>;
}

export default async function InvitationPage({ params }: PageProps) {
  // En Next.js 15+ los params son una Promise
  const { slug, guestToken } = await params;

  // 1. Buscar evento activo
  const event = await prisma.event.findUnique({
    where: { 
      slug: slug,
      status: "ACTIVE" 
    },
    include: { 
      template: true, 
      user: true 
    }
  });

  if (!event) {
    notFound();
  }

  if (event.paymentStatus !== "PAID") {
    const messageByStatus: Record<string, string> = {
      UNPAID: "Esta invitación está pendiente de pago. Contacta a quien te la envió.",
      PENDING_VOUCHER: "Esta invitación se está procesando. Disponible en pocas horas.",
      EXPIRED: "Esta invitación expiró por falta de pago.",
    };

    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
          <h1
            className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight font-serif"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Invitación no disponible
          </h1>
          <p className="mt-3 text-[var(--color-midnight)]/70">
            {messageByStatus[event.paymentStatus] ??
              "Esta invitación no está disponible por el momento."}
          </p>
        </div>
      </main>
    );
  }

  // 2. Buscar invitado
  const guest = await prisma.guest.findUnique({
    where: { 
      uniqueToken: guestToken 
    },
    include: { 
      rsvp: true 
    }
  });

  if (!guest || guest.eventId !== event.id) {
    notFound();
  }

  // 3. Registrar visita de forma no bloqueante (Analytics)
  prisma.invitationView.create({
    data: {
      guestId: guest.id,
      userAgent: null // Se podría extraer de los headers si es necesario después
    }
  }).catch(console.error);

  // 4. Renderizar el template correspondiente
  // Por ahora asumimos que todos van a Aurora según el seed, pero en el futuro
  // se podría hacer un switch(event.template.slug)
  return <AuroraTemplate event={event} guest={guest} />;
}
