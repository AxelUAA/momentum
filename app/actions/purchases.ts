"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const purchaseCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export type PurchaseItemInput = {
  productId: string;
  variantId: string | null;
  quantity: number;
  /** Costo unitario en centavos */
  unitCostCents: number;
};

export type PurchaseInput = {
  supplier?: string;
  notes?: string;
  items: PurchaseItemInput[];
  /** ISO date (yyyy-mm-dd); vacío = hoy */
  purchaseDate?: string;
};

export async function createPurchase(
  input: PurchaseInput
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "No autorizado" };
  }

  const items = input.items.filter((i) => i.quantity > 0);
  if (items.length === 0) return { ok: false, error: "Agrega al menos un producto." };
  if (items.some((i) => i.unitCostCents < 0)) {
    return { ok: false, error: "Hay costos inválidos." };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    include: { variants: true },
  });

  const purchaseItems: {
    productId: string;
    variantId: string | null;
    productName: string;
    variantName: string | null;
    quantity: number;
    unitCostCents: number;
  }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { ok: false, error: "Producto no encontrado." };
    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : null;
    if (item.variantId && !variant) {
      return { ok: false, error: "Variante no encontrada." };
    }
    purchaseItems.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      productName: product.name,
      variantName: variant?.name ?? null,
      quantity: Math.round(item.quantity),
      unitCostCents: Math.round(item.unitCostCents),
    });
  }

  const totalCents = purchaseItems.reduce(
    (s, i) => s + i.unitCostCents * i.quantity,
    0
  );
  const purchaseDate = input.purchaseDate
    ? new Date(`${input.purchaseDate}T12:00:00`)
    : new Date();

  try {
    const purchase = await prisma.$transaction(async (tx) => {
      const created = await tx.purchase.create({
        data: {
          code: `C-${purchaseCode()}`,
          supplier: input.supplier?.trim() || null,
          notes: input.notes?.trim() || null,
          totalCents,
          purchaseDate,
          items: { create: purchaseItems },
        },
      });

      for (const item of purchaseItems) {
        // Subir stock de la variante + kardex
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              variantName: item.variantName,
              delta: item.quantity,
              reason: "PURCHASE",
              refCode: created.code,
            },
          });
        }
        // Actualizar el costo unitario vigente del producto (último costo)
        await tx.product.update({
          where: { id: item.productId },
          data: { costCents: item.unitCostCents },
        });
      }

      return created;
    });

    revalidatePath("/admin/compras");
    revalidatePath("/admin/productos");
    revalidatePath("/admin");
    revalidatePath("/productos");
    revalidatePath("/");
    return { ok: true, code: purchase.code };
  } catch (e) {
    console.error("Error registrando compra:", e);
    return { ok: false, error: "No se pudo registrar la compra." };
  }
}
