"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upsertProduct, type ProductFormInput } from "@/app/actions/admin";

type Option = { id: string; name: string };

type FormState = {
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  price: string;
  compareAt: string;
  imageUrl: string;
  puffs: string;
  nicotineMg: string;
  volumeMl: string;
  batteryMah: string;
  featured: boolean;
  flavors: string;
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

export function ProductForm({
  productId,
  initial,
  brands,
  categories,
}: {
  productId?: string;
  initial?: Partial<FormState>;
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
    imageUrl: "",
    puffs: "",
    nicotineMg: "",
    volumeMl: "",
    batteryMah: "",
    featured: false,
    flavors: "",
    ...initial,
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toNumber(value: string): number | null {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      imageUrl: form.imageUrl,
      puffs: toNumber(form.puffs),
      nicotineMg: toNumber(form.nicotineMg),
      volumeMl: toNumber(form.volumeMl),
      batteryMah: toNumber(form.batteryMah),
      featured: form.featured,
      flavors: form.flavors.split("\n"),
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
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
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
        <Field label="Imagen (URL)">
          <input
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="/products/vape-1.svg o https://..."
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

      <Field label="Sabores / variantes (uno por línea)">
        <textarea
          value={form.flavors}
          onChange={(e) => set("flavors", e.target.value)}
          rows={5}
          placeholder={"Blue Razz Ice\nWatermelon Ice\nMango Peach"}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-accent"
        />
      </Field>

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
