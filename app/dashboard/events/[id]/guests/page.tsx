import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GuestsPageClient from "@/components/dashboard/guests/GuestsPageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GuestsPage({ params }: Props) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      guests: {
        include: {
          rsvp: true,
          _count: {
            select: { invitationViews: true }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!event) {
    notFound();
  }

  return <GuestsPageClient event={event} />;
}
