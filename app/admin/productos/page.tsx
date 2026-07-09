import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { productImages } from "@/lib/products";
import { ProductToggles } from "@/components/admin/ProductToggles";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const products = await prisma.product.findMany({
    include: { brand: true, category: true, variants: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl uppercase tracking-tight">
          Productos ({products.length})
        </h2>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-accent-foreground transition-colors duration-200 hover:bg-gold-deep"
        >
          <Plus className="h-4 w-4" /> Nuevo
        </Link>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
              <th className="px-5 py-4 font-semibold">Producto</th>
              <th className="hidden px-5 py-4 font-semibold md:table-cell">Marca</th>
              <th className="px-5 py-4 font-semibold">Stock</th>
              <th className="px-5 py-4 font-semibold">Precio</th>
              <th className="px-5 py-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const image = productImages(product)[0];
              const activeVariants = product.variants.filter((v) => v.isActive);
              const totalStock = activeVariants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr
                  key={product.id}
                  className={cn(
                    "border-b border-border last:border-0",
                    !product.isActive && "opacity-50"
                  )}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          aria-hidden
                          className="h-11 w-11 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 shrink-0 rounded-xl bg-muted" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {activeVariants.length}{" "}
                          {activeVariants.length === 1 ? "variante" : "variantes"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">
                    {product.brand?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "font-semibold",
                        totalStock <= 0
                          ? "text-destructive"
                          : totalStock < 20
                            ? "text-accent"
                            : "text-foreground"
                      )}
                    >
                      {totalStock}
                    </span>
                  </td>
                  <td className="px-5 py-3">{formatPrice(product.priceCents)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <ProductToggles
                        productId={product.id}
                        isActive={product.isActive}
                        featured={product.featured}
                      />
                      <Link
                        href={`/admin/productos/${product.id}`}
                        aria-label={`Editar ${product.name}`}
                        title="Editar"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:border-accent hover:text-accent"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
