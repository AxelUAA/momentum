import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveActiveSections } from "@/lib/tier-gate";
import { AuroraTemplate } from "@/components/templates/Aurora";
import { ConfettiTemplate } from "@/components/templates/Confetti";
import { BloomTemplate } from "@/components/templates/Bloom";
import { NubeTemplate } from "@/components/templates/Nube";

import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string;
    guestToken: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, guestToken } = await params;
  
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
  const description = `Estás invitado a este gran ${eventType.toLowerCase()}. Haz clic para ver todos los detalles de tu invitación personal.`;
  const image = event.coverImage || `${baseUrl}/og-default.png`;

  return {
    title: `${title} | Invitación Personal`,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/e/${slug}/${guestToken}`,
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

  // 4. Aplicar tier-gate sobre activeSections
  const guardedSections = resolveActiveSections(
    event.tier,
    (event.activeSections ?? {}) as Record<string, boolean>,
  );
  const eventForTemplate = { ...event, activeSections: guardedSections };

  // 5. Renderizar el template correspondiente
  switch (event.template.slug) {
    case "nube":
      return <NubeTemplate event={eventForTemplate as any} guest={guest} />;
    case "bloom":
      return <BloomTemplate event={eventForTemplate as any} guest={guest} />;
    case "confetti":
      return <ConfettiTemplate event={eventForTemplate as any} guest={guest} />;
    case "aurora":
    default:
      return <AuroraTemplate event={eventForTemplate as any} guest={guest} />;
  }
}
