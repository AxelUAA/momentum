"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const saleCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

function revalidateSales() {
  revalidatePath("/admin/ventas");
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  revalidatePath("/productos");
  revalidatePath("/");
}

export type SaleItemInput = {
  productId: string;
  variantId: string | null;
  quantity: number;
  /** Precio unitario en centavos (editable por el admin) */
  unitPriceCents: number;
};

export type SaleInput = {
  customerName: string;
  customerPhone?: string;
  type: "CASH" | "INSTALLMENTS";
  items: SaleItemInput[];
  /** Costo total de adquisición en centavos (opcional, para calcular ganancia) */
  costCents: number | null;
  /** Solo para plazos: primer abono/enganche en centavos */
  downPaymentCents: number | null;
  notes?: string;
  /** ISO date (yyyy-mm-dd); vacío = hoy */
  saleDate?: string;
};

export async function createSale(
  input: SaleInput
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "No autorizado" };
  }

  const items = input.items.filter((i) => i.quantity > 0);
  if (items.length === 0) return { ok: false, error: "Agrega al menos un producto." };
  if (!input.customerName.trim()) {
    return { ok: false, error: "El nombre del cliente es obligatorio." };
  }
  if (items.some((i) => i.unitPriceCents < 0)) {
    return { ok: false, error: "Hay precios inválidos." };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    include: { variants: true },
  });

  const saleItems: {
    productId: string;
    variantId: string | null;
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPriceCents: number;
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
    saleItems.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      productName: product.name,
      variantName: variant?.name ?? null,
      quantity: Math.round(item.quantity),
      unitPriceCents: Math.round(item.unitPriceCents),
    });
  }

  const totalCents = saleItems.reduce(
    (s, i) => s + i.unitPriceCents * i.quantity,
    0
  );

  // Costo automático desde el catálogo (se puede sobreescribir manualmente)
  const autoCostCents = saleItems.reduce((s, i) => {
    const product = products.find((p) => p.id === i.productId);
    return s + (product?.costCents ?? 0) * i.quantity;
  }, 0);
  const isInstallments = input.type === "INSTALLMENTS";
  const downPayment = isInstallments
    ? Math.min(Math.max(0, Math.round(input.downPaymentCents ?? 0)), totalCents)
    : totalCents;

  const saleDate = input.saleDate ? new Date(`${input.saleDate}T12:00:00`) : new Date();

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          code: `V-${saleCode()}`,
          customerName: input.customerName.trim(),
          customerPhone: input.customerPhone?.trim() || null,
          type: input.type,
          status: isInstallments && downPayment < totalCents ? "OPEN" : "PAID",
          totalCents,
          costCents:
            input.costCents != null
              ? Math.max(0, Math.round(input.costCents))
              : autoCostCents,
          notes: input.notes?.trim() || null,
          saleDate,
          items: { create: saleItems },
          ...(downPayment > 0
            ? {
                payments: {
                  create: {
                    amountCents: downPayment,
                    note: isInstallments ? "Enganche / primer abono" : "Pago de contado",
                    paidAt: saleDate,
                  },
                },
              }
            : {}),
        },
      });

      // Descontar stock de cada variante vendida (sin bajar de 0) + kardex
      for (const item of saleItems) {
        if (!item.variantId) continue;
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true },
        });
        if (variant) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: Math.max(0, variant.stock - item.quantity) },
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              variantName: item.variantName,
              delta: -item.quantity,
              reason: "SALE",
              refCode: created.code,
            },
          });
        }
      }

      return created;
    });

    revalidateSales();
    return { ok: true, code: sale.code };
  } catch (e) {
    console.error("Error registrando venta:", e);
    return { ok: false, error: "No se pudo registrar la venta." };
  }
}

export async function addSalePayment(
  saleId: string,
  amountCents: number,
  note?: string
): Promise<{ ok: true; settled: boolean } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "No autorizado" };
  }

  const amount = Math.round(amountCents);
  if (amount <= 0) return { ok: false, error: "El abono debe ser mayor a cero." };

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { payments: true },
  });
  if (!sale) return { ok: false, error: "Venta no encontrada." };
  if (sale.status === "CANCELLED") {
    return { ok: false, error: "La venta está cancelada." };
  }

  const paid = sale.payments.reduce((s, p) => s + p.amountCents, 0);
  const balance = sale.totalCents - paid;
  if (balance <= 0) return { ok: false, error: "La venta ya está liquidada." };
  if (amount > balance) {
    return {
      ok: false,
      error: `El abono excede el saldo pendiente (${(balance / 100).toFixed(2)}).`,
    };
  }

  const settled = amount >= balance;
  await prisma.sale.update({
    where: { id: saleId },
    data: {
      payments: { create: { amountCents: amount, note: note?.trim() || null } },
      ...(settled ? { status: "PAID" } : {}),
    },
  });

  revalidateSales();
  return { ok: true, settled };
}

export async function cancelSale(
  saleId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "No autorizado" };
  }

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { items: true },
  });
  if (!sale) return { ok: false, error: "Venta no encontrada." };
  if (sale.status === "CANCELLED") return { ok: true };

  await prisma.$transaction(async (tx) => {
    await tx.sale.update({ where: { id: saleId }, data: { status: "CANCELLED" } });
    // Devolver el stock descontado + kardex
    for (const item of sale.items) {
      if (!item.variantId) continue;
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
          reason: "SALE_CANCELLED",
          refCode: sale.code,
        },
      });
    }
  });

  revalidateSales();
  return { ok: true };
}
