import Link from "next/link";
import { formatPrice, formatPuffs } from "@/lib/format";
import { productImages, type ProductWithRelations } from "@/lib/products";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = productImages(product)[0];
  const hasDiscount =
    product.compareAtCents != null && product.compareAtCents > product.priceCents;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors duration-200 hover:border-accent/50"
    >
      <div className="relative aspect-square overflow-hidden bg-background">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase text-accent-foreground">
              Oferta
            </span>
          )}
          {product.puffs && (
            <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {formatPuffs(product.puffs)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {product.brand && (
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {product.brand.name}
          </p>
        )}
        <h3 className="mt-1 text-base font-semibold leading-snug">{product.name}</h3>
        {product.variants.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {product.variants.length}{" "}
            {product.variants.length === 1 ? "sabor" : "sabores"} disponibles
          </p>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-4">
          <span className="text-lg font-bold">{formatPrice(product.priceCents)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtCents!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
