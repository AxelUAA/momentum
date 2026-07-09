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

// ─── Pedidos ─────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: ShopOrderStatus) {
  await requireAdmin();
  await prisma.shopOrder.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return { ok: true };
}

// ─── Productos ───────────────────────────────────────────

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

export async function deleteProduct(
  productId: string
): Promise<{ ok: boolean; deactivated?: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.product.delete({ where: { id: productId } });
    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    revalidatePath("/");
    return { ok: true };
  } catch {
    // Tiene pedidos/favoritos asociados — desactivamos en lugar de borrar
    try {
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false, featured: false },
      });
      revalidatePath("/admin/productos");
      revalidatePath("/productos");
      revalidatePath("/");
      return { ok: true, deactivated: true };
    } catch {
      return { ok: false, error: "No se pudo eliminar el producto." };
    }
  }
}

export type VariantInput = {
  id?: string; // presente = variante existente
  name: string;
  stock: number;
  /** Precio override en centavos; null = usa el precio base del producto */
  priceCents: number | null;
};

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
  variants: VariantInput[];
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

  const variants = input.variants
    .map((v) => ({ ...v, name: v.name.trim() }))
    .filter((v) => v.name.length > 0);

  try {
    let productId: string;

    if (input.id) {
      await prisma.product.update({ where: { id: input.id }, data });
      productId = input.id;

      const existing = await prisma.productVariant.findMany({ where: { productId } });
      const keptIds = new Set(variants.filter((v) => v.id).map((v) => v.id!));

      // Desactivar variantes que ya no están en el formulario
      for (const variant of existing) {
        if (!keptIds.has(variant.id) && variant.isActive) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { isActive: false },
          });
        }
      }

      // Actualizar existentes y crear nuevas
      for (const [i, v] of variants.entries()) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              stock: Math.max(0, Math.round(v.stock)),
              priceCents: v.priceCents,
              isActive: true,
              sortOrder: i + 1,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId,
              name: v.name,
              stock: Math.max(0, Math.round(v.stock)),
              priceCents: v.priceCents,
              sortOrder: i + 1,
            },
          });
        }
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
            create: variants.map((v, i) => ({
              name: v.name,
              stock: Math.max(0, Math.round(v.stock)),
              priceCents: v.priceCents,
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

// ─── Marcas y categorías ─────────────────────────────────

export async function createBrand(
  name: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "El nombre es obligatorio." };
  try {
    const last = await prisma.brand.findFirst({ orderBy: { sortOrder: "desc" } });
    await prisma.brand.create({
      data: {
        name: trimmed,
        slug: slugify(trimmed),
        sortOrder: (last?.sortOrder ?? 0) + 1,
      },
    });
    revalidatePath("/admin/catalogo");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ya existe una marca con ese nombre." };
  }
}

export async function toggleBrandActive(brandId: string) {
  await requireAdmin();
  const brand = await prisma.brand.findUniqueOrThrow({
    where: { id: brandId },
    select: { isActive: true },
  });
  await prisma.brand.update({
    where: { id: brandId },
    data: { isActive: !brand.isActive },
  });
  revalidatePath("/admin/catalogo");
  revalidatePath("/productos");
  return { ok: true };
}

export async function createCategory(
  name: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "El nombre es obligatorio." };
  try {
    const last = await prisma.category.findFirst({ orderBy: { sortOrder: "desc" } });
    await prisma.category.create({
      data: {
        name: trimmed,
        slug: slugify(trimmed),
        sortOrder: (last?.sortOrder ?? 0) + 1,
      },
    });
    revalidatePath("/admin/catalogo");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ya existe una categoría con ese nombre." };
  }
}

export async function toggleCategoryActive(categoryId: string) {
  await requireAdmin();
  const category = await prisma.category.findUniqueOrThrow({
    where: { id: categoryId },
    select: { isActive: true },
  });
  await prisma.category.update({
    where: { id: categoryId },
    data: { isActive: !category.isActive },
  });
  revalidatePath("/admin/catalogo");
  revalidatePath("/productos");
  return { ok: true };
}
