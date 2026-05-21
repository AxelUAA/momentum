import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { resolveActiveSections } from "@/lib/tier-gate";
import { AuroraTemplate } from "@/components/templates/Aurora";
import { ConfettiTemplate } from "@/components/templates/Confetti";
import { BloomTemplate } from "@/components/templates/Bloom";
import { NubeTemplate } from "@/components/templates/Nube";

import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const event = await prisma.event.findUnique({
    where: { slug: slug },
    select: { title: true, coverImage: true, type: true }
  });

  if (!event) return { title: "Invitación no encontrada | Momentum" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://momentuminvites.com";
  
  const TYPE_LABELS: Record<string, string> = {
    WEDDING: "Nuestra Boda",
    XV: "Mis XV Años",
    BIRTHDAY: "Mi Cumpleaños",
    CORPORATE: "Evento",
    BAPTISM: "Bautizo",
    GRADUATION: "Graduación",
    BABY_SHOWER: "Baby Shower",
  };
  
  const eventType = TYPE_LABELS[event.type] || "Evento Especial";
  const title = event.title;
  const description = `Estás invitado a este gran ${eventType.toLowerCase()}. Haz clic para ver todos los detalles de la invitación.`;
  const image = event.coverImage || `${baseUrl}/og-default.png`;

  return {
    title: `${title} | Invitación`,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/e/${slug}`,
      siteName: "Momentum Invites",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "es_MX",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PublicInvitationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;

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

  // Si el evento no está activo, solo el ADMIN, el creador autenticado,
  // o el titular del portal (clientToken en ?preview=) pueden verlo
  if (event.status !== "ACTIVE") {
    const isPortalPreview = preview && event.clientToken && preview === event.clientToken;

    if (!isPortalPreview) {
      const session = await auth();
      const isAdmin = session?.user?.role === "ADMIN";
      const isOwner = session?.user?.id === event.userId;

      if (!isAdmin && !isOwner) {
        notFound();
      }
    }
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

  // 3. Aplicar tier-gate sobre activeSections antes de pasarlo al template
  const guardedSections = resolveActiveSections(
    event.tier,
    (event.activeSections ?? {}) as Record<string, boolean>,
  );
  const eventForTemplate = { ...event, activeSections: guardedSections };

  // 4. Renderizar template según el slug del template del evento
  const templateSlug = event.template.slug;

  switch (templateSlug) {
    case "nube":
      return <NubeTemplate event={eventForTemplate as any} guest={mockGuest as any} />;
    case "bloom":
      return <BloomTemplate event={eventForTemplate as any} guest={mockGuest as any} />;
    case "confetti":
      return <ConfettiTemplate event={eventForTemplate as any} guest={mockGuest as any} />;
    case "aurora":
    default:
      return <AuroraTemplate event={eventForTemplate as any} guest={mockGuest as any} />;
  }
}
