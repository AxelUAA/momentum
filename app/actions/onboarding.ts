"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function completeOnboarding() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[completeOnboarding] error:", error);
    return { success: false, error: "Error al completar el onboarding" };
  }
}
