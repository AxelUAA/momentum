import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuroraTemplate } from "@/components/templates/Aurora";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PublicInvitationPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Buscar evento (puede ser ACTIVE o DRAFT para preview del admin)
  const event = await prisma.event.findUnique({
    where: { slug: slug },
    include: { 
      template: true, 
      user: true 
    }
  });

  if (!event) {
    notFound();
  }

  // 2. Crear un invitado "mock" para la vista previa pública
  const mockGuest = {
    id: "preview",
    eventId: event.id,
    name: "Invitado de Prueba",
    uniqueToken: "preview",
    allowedGuests: 1,
    groupTag: "preview",
    createdAt: new Date(),
    updatedAt: new Date(),
    rsvp: null
  };

  // 3. Renderizar template
  return <AuroraTemplate event={event as any} guest={mockGuest as any} />;
}
