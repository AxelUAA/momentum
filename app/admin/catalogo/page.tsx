import { prisma } from "@/lib/prisma";
import { CatalogManager } from "@/components/admin/CatalogManager";
import {
  createBrand,
  createCategory,
  toggleBrandActive,
  toggleCategoryActive,
} from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminCatalogoPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <section>
      <h2 className="mb-6 font-heading text-2xl uppercase tracking-tight">
        Marcas y categorías
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <CatalogManager
          title="Marcas"
          items={brands.map((b) => ({
            id: b.id,
            name: b.name,
            isActive: b.isActive,
            productCount: b._count.products,
          }))}
          createAction={createBrand}
          toggleAction={toggleBrandActive}
        />
        <CatalogManager
          title="Categorías"
          items={categories.map((c) => ({
            id: c.id,
            name: c.name,
            isActive: c.isActive,
            productCount: c._count.products,
          }))}
          createAction={createCategory}
          toggleAction={toggleCategoryActive}
        />
      </div>
    </section>
  );
}
