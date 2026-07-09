"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "@/app/actions/admin";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!window.confirm(`¿Eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
          return;
        }
        startTransition(async () => {
          const result = await deleteProduct(productId);
          if (result.ok && result.deactivated) {
            toast.info("El producto tiene pedidos asociados; se ocultó de la tienda en lugar de borrarse.");
          } else if (result.ok) {
            toast.success("Producto eliminado");
          } else {
            toast.error(result.error ?? "No se pudo eliminar");
          }
        });
      }}
      disabled={pending}
      aria-label={`Eliminar ${productName}`}
      title="Eliminar"
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:border-destructive hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
