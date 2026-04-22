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
