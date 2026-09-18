"use client";

import { useState, useTransition } from "react";
import { Ban, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { addSalePayment, cancelSale } from "@/app/actions/sales";

const inputClass =
  "h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-foreground";

export function SalePaymentForm({ saleId }: { saleId: string }) {
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const value = parseFloat(amount);
        if (!Number.isFinite(value) || value <= 0) {
          toast.error("Escribe un monto válido.");
          return;
        }
        startTransition(async () => {
          const result = await addSalePayment(saleId, Math.round(value * 100));
          if (result.ok) {
            setAmount("");
            toast.success(
              result.settled ? "Abono registrado — venta liquidada 🎉" : "Abono registrado"
            );
          } else {
            toast.error(result.error);
          }
        });
      }}
      className="flex items-center gap-2"
    >
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        min="0"
        step="0.01"
        placeholder="Monto del abono"
        aria-label="Monto del abono"
        className={`${inputClass} w-36`}
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-foreground transition-colors duration-200 hover:bg-gold-deep disabled:opacity-50"
      >
        <HandCoins className="h-3.5 w-3.5" />
        Abonar
      </button>
    </form>
  );
}

export function CancelSaleButton({ saleId, code }: { saleId: string; code: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (
          !window.confirm(
            `¿Cancelar la venta ${code}? El stock vendido se devolverá al inventario.`
          )
        ) {
          return;
        }
        startTransition(async () => {
          const result = await cancelSale(saleId);
          if (result.ok) toast.success("Venta cancelada y stock devuelto");
          else toast.error(result.error ?? "No se pudo cancelar");
        });
      }}
      disabled={pending}
      aria-label={`Cancelar venta ${code}`}
      title="Cancelar venta (devuelve stock)"
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors duration-200 hover:border-destructive hover:text-destructive disabled:opacity-50"
    >
      <Ban className="h-3.5 w-3.5" />
      Cancelar
    </button>
  );
}
