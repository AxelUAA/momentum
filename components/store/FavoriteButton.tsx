"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleFavorite } from "@/app/actions/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  productId,
  initialFavorited,
}: {
  productId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await toggleFavorite(productId);
          if (result.ok) {
            setFavorited(result.favorited ?? false);
          } else if (result.error) {
            toast.error(result.error);
          }
        })
      }
      disabled={pending}
      aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={cn(
        "flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200",
        favorited
          ? "border-accent bg-accent/10 text-accent"
          : "border-border text-muted-foreground hover:border-accent/60 hover:text-accent"
      )}
    >
      <Heart className={cn("h-5 w-5", favorited && "fill-current")} />
    </button>
  );
}
