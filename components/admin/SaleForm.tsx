"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createSale, type SaleInput } from "@/app/actions/sales";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export type SaleFormProduct = {
  id: string;
  name: string;
  priceCents: number;
  variants: { id: string; name: string; stock: number; priceCents: number | null }[];
};

type ItemRow = {
  productId: string;
  variantId: string;
  quantity: string;
  price: string; // MXN
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

export function SaleForm({ products }: { products: SaleFormProduct[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [items, setItems] = useState<ItemRow[]>([
    { productId: "", variantId: "", quantity: "1", price: "" },
  ]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [type, setType] = useState<"CASH" | "INSTALLMENTS">("CASH");
  const [downPayment, setDownPayment] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [saleDate, setSaleDate] = useState(today());

  function productFor(row: ItemRow) {
    return products.find((p) => p.id === row.productId);
  }

  function defaultPrice(productId: string, variantId: string): string {
    const product = products.find((p) => p.id === productId);
    if (!product) return "";
    const variant = product.variants.find((v) => v.id === variantId);
    const cents = variant?.priceCents ?? product.priceCents;
    return (cents / 100).toString();
  }

  function setItem(index: number, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function handleProductChange(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    const firstAvailable =
      product?.variants.find((v) => v.stock > 0) ?? product?.variants[0];
    const variantId = firstAvailable?.id ?? "";
    setItem(index, {
      productId,
      variantId,
      price: productId ? defaultPrice(productId, variantId) : "",
    });
  }

  const totalCents = items.reduce((sum, row) => {
    const price = toNumber(row.price);
    const qty = toNumber(row.quantity);
    if (!price || !qty) return sum;
    return sum + Math.round(price * 100) * Math.round(qty);
  }, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validItems = items.filter((r) => r.productId && toNumber(r.quantity));
    if (validItems.length === 0) {
      toast.error("Agrega al menos un producto.");
      return;
    }

    const input: SaleInput = {
      customerName,
      customerPhone,
      type,
      items: validItems.map((r) => ({
        productId: r.productId,
        variantId: r.variantId || null,
        quantity: Math.round(toNumber(r.quantity) ?? 1),
        unitPriceCents: Math.round((toNumber(r.price) ?? 0) * 100),
      })),
      costCents: toNumber(cost) ? Math.round(toNumber(cost)! * 100) : null,
      downPaymentCents:
        type === "INSTALLMENTS" && toNumber(downPayment)
          ? Math.round(toNumber(downPayment)! * 100)
          : null,
      notes,
      saleDate,
    };

    startTransition(async () => {
      const result = await createSale(input);
      if (result.ok) {
        toast.success(`Venta ${result.code} registrada — stock actualizado`);
        router.push("/admin/ventas");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* ─── Productos ───────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Productos vendidos
          </span>
          <button
            type="button"
            onClick={() =>
              setItems((rows) => [
                ...rows,
                { productId: "", variantId: "", quantity: "1", price: "" },
              ])
            }
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors duration-200 hover:border-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar producto
          </button>
        </div>

        <div className="space-y-3">
          {items.map((row, i) => {
            const product = productFor(row);
            return (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 rounded-2xl border border-border bg-surface p-3 sm:grid-cols-[1.3fr_1fr_80px_110px_40px] sm:items-center"
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
                  onChange={(e) => {
                    setItem(i, {
                      variantId: e.target.value,
                      price: defaultPrice(row.productId, e.target.value),
                    });
                  }}
                  disabled={!product || product.variants.length === 0}
                  aria-label={`Variante ${i + 1}`}
                  className={cn(inputClass, "cursor-pointer disabled:opacity-50")}
                >
                  {!product || product.variants.length === 0 ? (
                    <option value="">Sin variantes</option>
                  ) : (
                    product.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.stock} en stock)
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
                  value={row.price}
                  onChange={(e) => setItem(i, { price: e.target.value })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio"
                  aria-label={`Precio unitario ${i + 1}`}
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
          El precio se prellenó del catálogo pero puedes cambiarlo (descuentos,
          precio especial, etc.). Al guardar, el stock de cada variante baja
          automáticamente.
        </p>
      </div>

      {/* ─── Cliente ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Cliente *
          </span>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            placeholder="Nombre del cliente"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Teléfono
          </span>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Opcional"
            className={inputClass}
          />
        </label>
      </div>

      {/* ─── Tipo de pago ────────────────────────────── */}
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Forma de pago
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("CASH")}
            className={cn(
              "flex-1 cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-200",
              type === "CASH"
                ? "border-foreground bg-primary text-primary-foreground"
                : "border-border hover:border-foreground"
            )}
          >
            Contado
          </button>
          <button
            type="button"
            onClick={() => setType("INSTALLMENTS")}
            className={cn(
              "flex-1 cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-200",
              type === "INSTALLMENTS"
                ? "border-foreground bg-primary text-primary-foreground"
                : "border-border hover:border-foreground"
            )}
          >
            A plazos
          </button>
        </div>
        {type === "INSTALLMENTS" && (
          <label className="mt-3 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Enganche / primer abono (MXN)
            </span>
            <input
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              className={inputClass}
            />
          </label>
        )}
      </div>

      {/* ─── Extras ──────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Costo de adquisición (MXN)
          </span>
          <input
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Lo que te costó (para calcular ganancia)"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Fecha de la venta
          </span>
          <input
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
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
          placeholder="Ej. acordamos abonos semanales de $200"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-foreground"
        />
      </label>

      {/* ─── Total + submit ──────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Total de la venta
          </p>
          <p className="font-heading text-3xl tracking-tight">
            {formatPrice(totalCents)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/ventas")}
            className="cursor-pointer rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending || totalCents <= 0}
            className="cursor-pointer rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors duration-200 hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Registrar venta"}
          </button>
        </div>
      </div>
    </form>
  );
}
