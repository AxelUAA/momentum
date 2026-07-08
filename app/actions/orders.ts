"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { customAlphabet } from "nanoid";

const orderCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

type OrderItemInput = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

export async function createShopOrder(input: {
  customerName?: string;
  customerPhone?: string;
  items: OrderItemInput[];
}): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  try {
    const items = input.items.filter((i) => i.quantity > 0 && i.quantity <= 50);
    if (items.length === 0) {
      return { ok: false, error: "El carrito está vacío." };
    }

    const session = await auth();

    // Precios desde la DB — nunca desde el cliente
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, isActive: true },
      include: { variants: true },
    });

    const orderItems = [];
    let totalCents = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : null;
      const unitPriceCents = variant?.priceCents ?? product.priceCents;
      totalCents += unitPriceCents * item.quantity;
      orderItems.push({
        productId: product.id,
        variantId: variant?.id ?? null,
        productName: product.name,
        variantName: variant?.name ?? null,
        quantity: item.quantity,
        unitPriceCents,
      });
    }

    if (orderItems.length === 0) {
      return { ok: false, error: "Los productos del carrito ya no están disponibles." };
    }

    const order = await prisma.shopOrder.create({
      data: {
        code: `MV-${orderCode()}`,
        userId: session?.user?.id ?? null,
        customerName:
          input.customerName?.trim() || session?.user?.name || "Cliente web",
        customerPhone: input.customerPhone?.trim() || null,
        totalCents,
        whatsappSentAt: new Date(),
        items: { create: orderItems },
      },
    });

    return { ok: true, code: order.code };
  } catch (e) {
    console.error("Error creando pedido:", e);
    return { ok: false, error: "No se pudo registrar el pedido." };
  }
}
