import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditEventClient from "@/components/dashboard/events/EditEventClient";

import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) notFound();

  return <EditEventClient event={event} isAdmin={isAdmin} />;
}
