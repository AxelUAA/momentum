"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavorite(
  productId: string
): Promise<{ ok: boolean; favorited?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Inicia sesión para guardar favoritos." };
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({
      data: { userId: session.user.id, productId },
    });
  }

  revalidatePath("/cuenta");
  return { ok: true, favorited: !existing };
}
