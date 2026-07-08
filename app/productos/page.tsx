import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductCard } from "@/components/store/ProductCard";
import { FiltersBar } from "@/components/store/FiltersBar";
import { getBrands, getCategories, getProducts, type ProductFilters } from "@/lib/products";

export const metadata: Metadata = {
  title: "Catálogo | Momentum",
  description:
    "Explora el catálogo completo de vapes desechables y pods recargables. Filtra por marca, categoría y precio.",
};

type SearchParams = Promise<{
  categoria?: string;
  marca?: string;
  q?: string;
  orden?: string;
}>;

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters: ProductFilters = {
    categoria: params.categoria,
    marca: params.marca,
    q: params.q,
    orden: params.orden as ProductFilters["orden"],
  };

  const [products, brands, categories] = await Promise.all([
    getProducts(filters),
    getBrands(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-32">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {products.length} {products.length === 1 ? "producto" : "productos"}
        </p>
        <h1 className="mt-2 font-heading text-4xl uppercase tracking-tight md:text-6xl">
          Catálogo
        </h1>
      </div>

      <Suspense>
        <FiltersBar
          brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </Suspense>

      {products.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-border bg-card p-12 text-center">
          <p className="font-heading text-2xl uppercase">Sin resultados</p>
          <p className="mt-2 text-muted-foreground">
            No encontramos productos con esos filtros. Prueba con otra búsqueda.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
