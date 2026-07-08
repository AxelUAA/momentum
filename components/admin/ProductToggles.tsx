"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Star, Eye, EyeOff } from "lucide-react";
import { toggleProductActive, toggleProductFeatured } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

export function ProductToggles({
  productId,
  isActive,
  featured,
}: {
  productId: string;
  isActive: boolean;
  featured: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean }>) {
    startTransition(async () => {
      try {
        await action();
      } catch {
        toast.error("No se pudo actualizar");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => run(() => toggleProductFeatured(productId))}
        disabled={pending}
        aria-label={featured ? "Quitar de destacados" : "Marcar como destacado"}
        title={featured ? "Destacado" : "Marcar destacado"}
        className={cn(
          "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200 disabled:opacity-50",
          featured
            ? "border-accent bg-accent/10 text-accent"
            : "border-border text-muted-foreground hover:text-accent"
        )}
      >
        <Star className={cn("h-4 w-4", featured && "fill-current")} />
      </button>
      <button
        onClick={() => run(() => toggleProductActive(productId))}
        disabled={pending}
        aria-label={isActive ? "Ocultar producto" : "Publicar producto"}
        title={isActive ? "Visible en tienda" : "Oculto"}
        className={cn(
          "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200 disabled:opacity-50",
          isActive
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : "border-border text-muted-foreground hover:text-foreground"
        )}
      >
        {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  );
}
