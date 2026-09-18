"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createPurchase, type PurchaseInput } from "@/app/actions/purchases";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PurchaseFormProduct = {
  id: string;
  name: string;
  costCents: number;
  variants: { id: string; name: string; stock: number }[];
};

type ItemRow = {
  productId: string;
  variantId: string;
  quantity: string;
  cost: string; // MXN unitario
};

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-foreground";

function toNumber(value: string): number | null {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PurchaseForm({ products }: { products: PurchaseFormProduct[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<ItemRow[]>([
    { productId: "", variantId: "", quantity: "1", cost: "" },
  ]);
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());

  function setItem(index: number, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function handleProductChange(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    setItem(index, {
      productId,
      variantId: product?.variants[0]?.id ?? "",
      cost:
        product && product.costCents > 0
          ? (product.costCents / 100).toString()
          : "",
    });
  }

  const totalCents = items.reduce((sum, row) => {
    const cost = toNumber(row.cost);
    const qty = toNumber(row.quantity);
    if (!cost || !qty) return sum;
    return sum + Math.round(cost * 100) * Math.round(qty);
  }, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items.filter(
      (r) => r.productId && toNumber(r.quantity) && toNumber(r.cost) != null
    );
    if (validItems.length === 0) {
      toast.error("Agrega al menos un producto con cantidad y costo.");
      return;
    }

    const input: PurchaseInput = {
      supplier,
      notes,
      purchaseDate,
      items: validItems.map((r) => ({
        productId: r.productId,
        variantId: r.variantId || null,
        quantity: Math.round(toNumber(r.quantity) ?? 1),
        unitCostCents: Math.round((toNumber(r.cost) ?? 0) * 100),
      })),
    };

    startTransition(async () => {
      const result = await createPurchase(input);
      if (result.ok) {
        toast.success(
          `Compra ${result.code} registrada — stock y costos actualizados`
        );
        router.push("/admin/compras");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Mercancía que llegó
          </span>
          <button
            type="button"
            onClick={() =>
              setItems((rows) => [
                ...rows,
                { productId: "", variantId: "", quantity: "1", cost: "" },
              ])
            }
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors duration-200 hover:border-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar producto
          </button>
        </div>

        <div className="space-y-3">
          {items.map((row, i) => {
            const product = products.find((p) => p.id === row.productId);
            return (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 rounded-2xl border border-border bg-surface p-3 sm:grid-cols-[1.3fr_1fr_80px_120px_40px] sm:items-center"
              >
                <select
                  value={row.productId}
                  onChange={(e) => handleProductChange(i, e.target.value)}
                  aria-label={`Producto ${i + 1}`}
                  className={cn(inputClass, "cursor-pointer")}
                >
                  <option value="">Elige producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <select
                  value={row.variantId}
                  onChange={(e) => setItem(i, { variantId: e.target.value })}
                  disabled={!product || product.variants.length === 0}
                  aria-label={`Variante ${i + 1}`}
                  className={cn(inputClass, "cursor-pointer disabled:opacity-50")}
                >
                  {!product || product.variants.length === 0 ? (
                    <option value="">Sin variantes</option>
                  ) : (
                    product.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} (hay {v.stock})
                      </option>
                    ))
                  )}
                </select>

                <input
                  value={row.quantity}
                  onChange={(e) => setItem(i, { quantity: e.target.value })}
                  type="number"
                  min="1"
                  aria-label={`Cantidad ${i + 1}`}
                  className={inputClass}
                />

                <input
                  value={row.cost}
                  onChange={(e) => setItem(i, { cost: e.target.value })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Costo c/u"
                  aria-label={`Costo unitario ${i + 1}`}
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() => setItems((rows) => rows.filter((_, j) => j !== i))}
                  aria-label={`Quitar producto ${i + 1}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Al guardar: el stock de cada variante sube y el costo unitario del
          producto se actualiza (con él se calcula tu ganancia en cada venta).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Proveedor
          </span>
          <input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Opcional"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Fecha de la compra
          </span>
          <input
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            type="date"
            max={today()}
            className={cn(inputClass, "cursor-pointer")}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Notas
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Ej. pedido al mayorista, llegó incompleto, etc."
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-foreground"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Total invertido
          </p>
          <p className="font-heading text-3xl tracking-tight">
            {formatPrice(totalCents)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/compras")}
            className="cursor-pointer rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending || totalCents <= 0}
            className="cursor-pointer rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors duration-200 hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Registrar compra"}
          </button>
        </div>
      </div>
    </form>
  );
}
