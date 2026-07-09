"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  upsertProduct,
  type ProductFormInput,
  type VariantInput,
} from "@/app/actions/admin";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";

type Option = { id: string; name: string };

export type VariantRow = {
  id?: string;
  name: string;
  stock: string;
  price: string; // MXN, vacío = usa precio base
};

type FormState = {
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  price: string;
  compareAt: string;
  puffs: string;
  nicotineMg: string;
  volumeMl: string;
  batteryMah: string;
  featured: boolean;
};

const inputClass =
  "h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function toNumber(value: string): number | null {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

export function ProductForm({
  productId,
  initial,
  initialVariants,
  initialImages,
  brands,
  categories,
}: {
  productId?: string;
  initial?: Partial<FormState>;
  initialVariants?: VariantRow[];
  initialImages?: string[];
  brands: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
    price: "",
    compareAt: "",
    puffs: "",
    nicotineMg: "",
    volumeMl: "",
    batteryMah: "",
    featured: false,
    ...initial,
  });
  const [variants, setVariants] = useState<VariantRow[]>(
    initialVariants?.length ? initialVariants : [{ name: "", stock: "25", price: "" }]
  );
  const [images, setImages] = useState<string[]>(initialImages ?? []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const variantInputs: VariantInput[] = variants
      .filter((v) => v.name.trim())
      .map((v) => ({
        id: v.id,
        name: v.name,
        stock: toNumber(v.stock) ?? 0,
        priceCents: toNumber(v.price) ? Math.round(toNumber(v.price)! * 100) : null,
      }));

    const input: ProductFormInput = {
      id: productId,
      name: form.name,
      description: form.description,
      brandId: form.brandId,
      categoryId: form.categoryId,
      priceCents: Math.round((toNumber(form.price) ?? 0) * 100),
      compareAtCents: toNumber(form.compareAt)
        ? Math.round(toNumber(form.compareAt)! * 100)
        : null,
      images,
      puffs: toNumber(form.puffs),
      nicotineMg: toNumber(form.nicotineMg),
      volumeMl: toNumber(form.volumeMl),
      batteryMah: toNumber(form.batteryMah),
      featured: form.featured,
      variants: variantInputs,
    };

    startTransition(async () => {
      const result = await upsertProduct(input);
      if (result.ok) {
        toast.success(productId ? "Producto actualizado" : "Producto creado");
        router.push("/admin/productos");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* ─── Fotos ───────────────────────────────────── */}
      <ProductImagesManager images={images} onChange={setImages} />

      {/* ─── Datos generales ─────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Nombre *">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder="ELFBAR BC10000"
            className={inputClass}
          />
        </Field>
        <Field label="Marca">
          <select
            value={form.brandId}
            onChange={(e) => set("brandId", e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Sin marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Categoría">
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Precio (MXN) *">
          <input
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
            type="number"
            min="1"
            step="0.01"
            placeholder="349"
            className={inputClass}
          />
        </Field>
        <Field label="Precio anterior (para mostrar oferta)">
          <input
            value={form.compareAt}
            onChange={(e) => set("compareAt", e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="399"
            className={inputClass}
          />
        </Field>
        <Field label="Puffs">
          <input
            value={form.puffs}
            onChange={(e) => set("puffs", e.target.value)}
            type="number"
            min="0"
            placeholder="10000"
            className={inputClass}
          />
        </Field>
        <Field label="Nicotina (mg/ml)">
          <input
            value={form.nicotineMg}
            onChange={(e) => set("nicotineMg", e.target.value)}
            type="number"
            min="0"
            step="0.1"
            placeholder="50"
            className={inputClass}
          />
        </Field>
        <Field label="Líquido (ml)">
          <input
            value={form.volumeMl}
            onChange={(e) => set("volumeMl", e.target.value)}
            type="number"
            min="0"
            step="0.1"
            placeholder="18"
            className={inputClass}
          />
        </Field>
        <Field label="Batería (mAh)">
          <input
            value={form.batteryMah}
            onChange={(e) => set("batteryMah", e.target.value)}
            type="number"
            min="0"
            placeholder="1000"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Descripción">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          placeholder="Describe el producto..."
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-accent"
        />
      </Field>

      {/* ─── Variantes con stock ─────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sabores / variantes y stock
          </span>
          <button
            type="button"
            onClick={() =>
              setVariants((rows) => [...rows, { name: "", stock: "25", price: "" }])
            }
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar variante
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="hidden grid-cols-[1fr_110px_130px_44px] gap-2 border-b border-border bg-card px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:grid">
            <span>Sabor / variante</span>
            <span>Stock</span>
            <span>Precio especial</span>
            <span />
          </div>
          <div className="divide-y divide-border">
            {variants.map((variant, i) => (
              <div
                key={variant.id ?? `new-${i}`}
                className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[1fr_110px_130px_44px] sm:items-center"
              >
                <input
                  value={variant.name}
                  onChange={(e) => setVariant(i, { name: e.target.value })}
                  placeholder="Blue Razz Ice"
                  aria-label={`Nombre de la variante ${i + 1}`}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-accent"
                />
                <input
                  value={variant.stock}
                  onChange={(e) => setVariant(i, { stock: e.target.value })}
                  type="number"
                  min="0"
                  placeholder="0"
                  aria-label={`Stock de la variante ${i + 1}`}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition-colors duration-200 focus:border-accent"
                />
                <input
                  value={variant.price}
                  onChange={(e) => setVariant(i, { price: e.target.value })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Base"
                  aria-label={`Precio especial de la variante ${i + 1}`}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setVariants((rows) => rows.filter((_, j) => j !== i))}
                  aria-label={`Quitar variante ${i + 1}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          El stock se descuenta manualmente por ahora; una variante en 0 se
          muestra como agotada en la tienda. "Precio especial" es opcional — si
          se deja vacío usa el precio base.
        </p>
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="h-5 w-5 cursor-pointer accent-[#F5B942]"
        />
        <span className="text-sm font-medium">Mostrar en destacados del inicio</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-full bg-accent px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-accent-foreground transition-colors duration-200 hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Guardando..." : productId ? "Guardar cambios" : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/productos")}
          className="cursor-pointer rounded-full border border-border px-8 py-3.5 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
