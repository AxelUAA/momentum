import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { productImages } from "@/lib/products";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.brand.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <section>
      <h2 className="mb-6 font-heading text-2xl uppercase tracking-tight">
        Editar: {product.name}
      </h2>
      <ProductForm
        productId={product.id}
        initial={{
          name: product.name,
          description: product.description ?? "",
          brandId: product.brandId ?? "",
          categoryId: product.categoryId ?? "",
          price: (product.priceCents / 100).toString(),
          compareAt: product.compareAtCents
            ? (product.compareAtCents / 100).toString()
            : "",
          imageUrl: productImages(product)[0] ?? "",
          puffs: product.puffs?.toString() ?? "",
          nicotineMg: product.nicotineMg?.toString() ?? "",
          volumeMl: product.volumeMl?.toString() ?? "",
          batteryMah: product.batteryMah?.toString() ?? "",
          featured: product.featured,
        }}
        initialVariants={product.variants
          .filter((v) => v.isActive)
          .map((v) => ({
            id: v.id,
            name: v.name,
            stock: v.stock.toString(),
            price: v.priceCents ? (v.priceCents / 100).toString() : "",
          }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </section>
  );
}
