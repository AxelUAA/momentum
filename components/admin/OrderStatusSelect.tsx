"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/actions/admin";
import type { ShopOrderStatus } from "@prisma/client";

const options: { value: ShopOrderStatus; label: string }[] = [
  { value: "NEW", label: "Nuevo" },
  { value: "CONTACTED", label: "En contacto" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: ShopOrderStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          try {
            await updateOrderStatus(orderId, e.target.value as ShopOrderStatus);
            toast.success("Estado actualizado");
          } catch {
            toast.error("No se pudo actualizar el estado");
          }
        })
      }
      aria-label="Estado del pedido"
      className="h-9 cursor-pointer rounded-full border border-border bg-card px-3 text-xs font-semibold outline-none transition-colors duration-200 focus:border-accent disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
