import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NuevoProductoPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <section>
      <h2 className="mb-6 font-heading text-2xl uppercase tracking-tight">
        Nuevo producto
      </h2>
      <ProductForm
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </section>
  );
}
