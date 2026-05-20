import { prisma } from "@/lib/prisma";
import PlantillasClient from "./PlantillasClient";

export const metadata = {
  title: "Plantillas | Momentum",
  description: "Elige la invitación digital perfecta para tu evento. Bodas, XV años, cumpleaños y más.",
};

export default async function PlantillasPage() {
  const templates = await prisma.template.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      type: true,
      description: true,
      previewImageUrl: true,
      isPremium: true,
    },
  });

  return <PlantillasClient templates={templates} />;
}
