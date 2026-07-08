"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Option = { slug: string; name: string };

export function FiltersBar({
  brands,
  categories,
}: {
  brands: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const categoria = searchParams.get("categoria");
  const marca = searchParams.get("marca");
  const orden = searchParams.get("orden") ?? "";

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/productos?${params.toString()}`, { scroll: false });
  }

  const hasFilters = categoria || marca || searchParams.get("q") || orden;

  return (
    <div className="space-y-4">
      {/* Búsqueda + orden */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", query.trim() || null);
          }}
          className="relative flex-1"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto o sabor..."
            aria-label="Buscar producto o sabor"
            className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-accent"
          />
        </form>
        <select
          value={orden}
          onChange={(e) => setParam("orden", e.target.value || null)}
          aria-label="Ordenar productos"
          className="h-12 cursor-pointer rounded-full border border-border bg-card px-5 text-sm outline-none transition-colors duration-200 focus:border-accent"
        >
          <option value="">Relevancia</option>
          <option value="novedades">Novedades</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
        </select>
      </div>

      {/* Chips de categoría y marca */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => setParam("categoria", categoria === c.slug ? null : c.slug)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
              categoria === c.slug
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground"
            )}
          >
            {c.name}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        {brands.map((b) => (
          <button
            key={b.slug}
            onClick={() => setParam("marca", marca === b.slug ? null : b.slug)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
              marca === b.slug
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground"
            )}
          >
            {b.name}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={() => router.push("/productos", { scroll: false })}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
