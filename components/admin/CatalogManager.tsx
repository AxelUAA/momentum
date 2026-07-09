"use client";

import { useState, useTransition } from "react";
import { Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  isActive: boolean;
  productCount: number;
};

export function CatalogManager({
  title,
  items,
  createAction,
  toggleAction,
}: {
  title: string;
  items: Item[];
  createAction: (name: string) => Promise<{ ok: boolean; error?: string }>;
  toggleAction: (id: string) => Promise<{ ok: boolean }>;
}) {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <h3 className="font-heading text-xl uppercase tracking-tight">{title}</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          startTransition(async () => {
            const result = await createAction(name);
            if (result.ok) {
              setName("");
              toast.success("Agregado");
            } else {
              toast.error(result.error ?? "No se pudo agregar");
            }
          });
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Nueva ${title.toLowerCase().replace(/s$/, "")}...`}
          aria-label={`Nombre de nueva ${title.toLowerCase()}`}
          className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending || !name.trim()}
          aria-label="Agregar"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors duration-200 hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <ul className="mt-5 divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-3">
            <div className={cn("min-w-0", !item.isActive && "opacity-50")}>
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.productCount}{" "}
                {item.productCount === 1 ? "producto" : "productos"}
              </p>
            </div>
            <button
              onClick={() =>
                startTransition(async () => {
                  try {
                    await toggleAction(item.id);
                  } catch {
                    toast.error("No se pudo actualizar");
                  }
                })
              }
              disabled={pending}
              aria-label={item.isActive ? `Ocultar ${item.name}` : `Mostrar ${item.name}`}
              title={item.isActive ? "Visible en tienda" : "Oculto"}
              className={cn(
                "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200 disabled:opacity-50",
                item.isActive
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">
            Sin registros todavía.
          </li>
        )}
      </ul>
    </div>
  );
}
