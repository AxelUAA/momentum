"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ExpenseCategory } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export async function createExpense(input: {
  description: string;
  category: ExpenseCategory;
  amountCents: number;
  /** ISO date (yyyy-mm-dd); vacío = hoy */
  expenseDate?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "No autorizado" };
  }

  if (!input.description.trim()) {
    return { ok: false, error: "Describe el gasto." };
  }
  const amount = Math.round(input.amountCents);
  if (amount <= 0) return { ok: false, error: "El monto debe ser mayor a cero." };

  await prisma.expense.create({
    data: {
      description: input.description.trim(),
      category: input.category,
      amountCents: amount,
      expenseDate: input.expenseDate
        ? new Date(`${input.expenseDate}T12:00:00`)
        : new Date(),
    },
  });

  revalidatePath("/admin/gastos");
  revalidatePath("/admin/resultados");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteExpense(
  expenseId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "No autorizado" };
  }

  await prisma.expense.delete({ where: { id: expenseId } });

  revalidatePath("/admin/gastos");
  revalidatePath("/admin/resultados");
  revalidatePath("/admin");
  return { ok: true };
}
