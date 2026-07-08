"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Variant = {
  id: string;
  name: string;
  priceCents: number | null;
  stock: number;
};

export function AddToCart({
  product,
  variants,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    image: string | null;
  };
  variants: Variant[];
}) {
  const { addItem } = useCart();
  const available = variants.filter((v) => v.stock > 0);
  const [selected, setSelected] = useState<Variant | null>(available[0] ?? null);
  const [quantity, setQuantity] = useState(1);

  const needsVariant = variants.length > 0;
  const priceCents = selected?.priceCents ?? product.priceCents;
  const canAdd = !needsVariant || selected !== null;

  return (
    <div className="space-y-6">
      {needsVariant && (
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Sabor / variante
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const outOfStock = variant.stock <= 0;
              const isSelected = selected?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => !outOfStock && setSelected(variant)}
                  disabled={outOfStock}
                  className={cn(
                    "rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-200",
                    outOfStock
                      ? "cursor-not-allowed border-border text-muted-foreground/50 line-through"
                      : isSelected
                        ? "cursor-pointer border-accent bg-accent text-accent-foreground"
                        : "cursor-pointer border-border bg-card text-foreground hover:border-accent/60"
                  )}
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex w-fit items-center rounded-full border border-border">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Restar uno"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(50, q + 1))}
            aria-label="Sumar uno"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => {
            addItem(
              {
                productId: product.id,
                variantId: selected?.id ?? null,
                slug: product.slug,
                name: product.name,
                variantName: selected?.name ?? null,
                priceCents,
                image: product.image,
              },
              quantity
            );
          }}
          disabled={!canAdd}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-accent-foreground transition-colors duration-200 hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag className="h-4 w-4" />
          Agregar — {formatPrice(priceCents * quantity)}
        </button>
      </div>

      {needsVariant && available.length === 0 && (
        <p className="text-sm font-medium text-destructive">
          Agotado por el momento — pregúntanos por WhatsApp cuándo llega.
        </p>
      )}
    </div>
  );
}
