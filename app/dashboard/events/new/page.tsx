import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import NewEventWizardClient from "./WizardClient";

export default async function NewEventPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const templates = await prisma.template.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, type: true, previewImageUrl: true, isPremium: true },
    orderBy: { sortOrder: "asc" },
  });

  return <NewEventWizardClient isAdmin={isAdmin} templates={templates} />;
}
