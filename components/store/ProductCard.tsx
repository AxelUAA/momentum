import Link from "next/link";
import { formatPrice, formatPuffs } from "@/lib/format";
import { productImages, type ProductWithRelations } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = productImages(product)[0];
  const hasDiscount =
    product.compareAtCents != null && product.compareAtCents > product.priceCents;
  const availableFlavors = product.variants.filter((v) => v.stock > 0);
  const soldOut = product.variants.length > 0 && availableFlavors.length === 0;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-200 hover:border-foreground"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
              soldOut && "opacity-40 grayscale"
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold uppercase text-background">
              Agotado
            </span>
          ) : (
            hasDiscount && (
              <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold uppercase text-background">
                Oferta
              </span>
            )
          )}
          {product.puffs && (
            <span className="rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-semibold">
              {formatPuffs(product.puffs)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {product.brand.name}
          </p>
        )}
        <h3 className="mt-1 text-sm font-semibold leading-snug md:text-base">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {soldOut
            ? "Pregunta cuándo llega"
            : product.variants.length > 0
              ? `${availableFlavors.length} ${availableFlavors.length === 1 ? "sabor disponible" : "sabores disponibles"}`
              : "Disponible"}
        </p>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-bold">{formatPrice(product.priceCents)}</span>
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
