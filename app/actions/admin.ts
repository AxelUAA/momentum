"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ShopOrderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function updateOrderStatus(orderId: string, status: ShopOrderStatus) {
  await requireAdmin();
  await prisma.shopOrder.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/pedidos");
  return { ok: true };
}

export async function toggleProductActive(productId: string) {
  await requireAdmin();
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    select: { isActive: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: { isActive: !product.isActive },
  });
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true };
}

export async function toggleProductFeatured(productId: string) {
  await requireAdmin();
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    select: { featured: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: { featured: !product.featured },
  });
  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { ok: true };
}

export type ProductFormInput = {
  id?: string;
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  priceCents: number;
  compareAtCents: number | null;
  imageUrl: string;
  puffs: number | null;
  nicotineMg: number | null;
  volumeMl: number | null;
  batteryMah: number | null;
  featured: boolean;
  /** Un sabor/variante por línea */
  flavors: string[];
};

export async function upsertProduct(
  input: ProductFormInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();

  if (!input.name.trim()) return { ok: false, error: "El nombre es obligatorio." };
  if (!input.priceCents || input.priceCents <= 0) {
    return { ok: false, error: "El precio debe ser mayor a cero." };
  }

  const data = {
    name: input.name.trim(),
    description: input.description.trim() || null,
    brandId: input.brandId || null,
    categoryId: input.categoryId || null,
    priceCents: Math.round(input.priceCents),
    compareAtCents: input.compareAtCents ? Math.round(input.compareAtCents) : null,
    images: input.imageUrl.trim() ? [input.imageUrl.trim()] : [],
    puffs: input.puffs,
    nicotineMg: input.nicotineMg,
    volumeMl: input.volumeMl,
    batteryMah: input.batteryMah,
    featured: input.featured,
  };

  const flavors = input.flavors.map((f) => f.trim()).filter(Boolean);

  try {
    let productId: string;

    if (input.id) {
      await prisma.product.update({ where: { id: input.id }, data });
      productId = input.id;

      // Sincronizar variantes: desactivar las que ya no están, crear las nuevas
      const existing = await prisma.productVariant.findMany({
        where: { productId },
      });
      for (const variant of existing) {
        const stillListed = flavors.includes(variant.name);
        if (variant.isActive !== stillListed) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { isActive: stillListed },
          });
        }
      }
      const existingNames = existing.map((v) => v.name);
      const newFlavors = flavors.filter((f) => !existingNames.includes(f));
      for (const [i, flavor] of newFlavors.entries()) {
        await prisma.productVariant.create({
          data: { productId, name: flavor, stock: 25, sortOrder: existing.length + i + 1 },
        });
      }
    } else {
      const baseSlug = slugify(input.name);
      const collision = await prisma.product.findUnique({ where: { slug: baseSlug } });
      const slug = collision ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

      const product = await prisma.product.create({
        data: {
          ...data,
          slug,
          variants: {
            create: flavors.map((flavor, i) => ({
              name: flavor,
              stock: 25,
              sortOrder: i + 1,
            })),
          },
        },
      });
      productId = product.id;
    }

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    revalidatePath("/");
    return { ok: true, id: productId };
  } catch (e) {
    console.error("Error guardando producto:", e);
    return { ok: false, error: "No se pudo guardar el producto." };
  }
}
