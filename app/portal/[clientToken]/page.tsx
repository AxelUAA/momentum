import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ clientToken: string }>;
};

/**
 * El portal externo ya no existe — todo se gestiona desde el dashboard.
 * Redirige al usuario al dashboard de su invitación (requiere login).
 */
export default async function ClientPortalPage({ params }: Props) {
  const { clientToken } = await params;

  const event = await prisma.event.findUnique({
    where: { clientToken },
    select: { id: true },
  });

  if (!event) notFound();

  redirect(`/dashboard/mi-invitacion/${event.id}`);
}
