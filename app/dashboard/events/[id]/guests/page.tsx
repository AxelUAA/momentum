import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import GuestsPageClient from "@/components/dashboard/guests/GuestsPageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GuestsPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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

  if (!event) notFound();

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && event.userId !== session.user.id) notFound();

  return <GuestsPageClient event={event} />;
}
