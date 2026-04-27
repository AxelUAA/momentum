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

  // Gating: paymentStatus + activeUntil
  const now = new Date();
  const isExpired = event.activeUntil ? new Date(event.activeUntil) < now : false;

  if (event.paymentStatus !== "PAID" || isExpired) {
    const messageByStatus: Record<string, string> = {
      UNPAID: "Esta invitación está pendiente de pago. Contacta a quien te la envió.",
      PENDING_VOUCHER: "Esta invitación se está procesando. Disponible en pocas horas.",
      EXPIRED: "Esta invitación expiró.",
    };
    const message = isExpired
      ? "Esta invitación ya no está disponible. El periodo de acceso terminó."
      : messageByStatus[event.paymentStatus] ??
        "Esta invitación no está disponible por el momento.";

    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
          <h1
            className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight font-serif"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Invitación no disponible
          </h1>
          <p className="mt-3 text-[var(--color-midnight)]/70">{message}</p>
        </div>
      </main>
    );
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
