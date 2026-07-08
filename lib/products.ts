import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ProductFilters = {
  categoria?: string;
  marca?: string;
  q?: string;
  orden?: "novedades" | "precio-asc" | "precio-desc";
};

const productInclude = {
  brand: true,
  category: true,
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export function productImages(product: { images: Prisma.JsonValue }): string[] {
  return Array.isArray(product.images) ? (product.images as string[]) : [];
}

export async function getProducts(filters: ProductFilters = {}) {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.categoria) where.category = { slug: filters.categoria };
  if (filters.marca) where.brand = { slug: filters.marca };
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { variants: { some: { name: { contains: filters.q, mode: "insensitive" } } } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    filters.orden === "precio-asc"
      ? [{ priceCents: "asc" }]
      : filters.orden === "precio-desc"
        ? [{ priceCents: "desc" }]
        : filters.orden === "novedades"
          ? [{ createdAt: "desc" }]
          : [{ sortOrder: "asc" }, { createdAt: "desc" }];

  return prisma.product.findMany({ where, include: productInclude, orderBy });
}

export async function getFeaturedProducts(take = 4) {
  return prisma.product.findMany({
    where: { isActive: true, featured: true },
    include: productInclude,
    orderBy: { sortOrder: "asc" },
    take,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
}

export async function getRelatedProducts(product: ProductWithRelations, take = 4) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      OR: [
        { categoryId: product.categoryId ?? undefined },
        { brandId: product.brandId ?? undefined },
      ],
    },
    include: productInclude,
    orderBy: { sortOrder: "asc" },
    take,
  });
}

export async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}
