"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ExpenseCategory } from "@prisma/client";
import { createExpense, deleteExpense } from "@/app/actions/expenses";
import { cn } from "@/lib/utils";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "SHIPPING", label: "Envíos" },
  { value: "TRANSPORT", label: "Gasolina / traslados" },
  { value: "PACKAGING", label: "Empaque" },
  { value: "MARKETING", label: "Publicidad" },
  { value: "SERVICES", label: "Servicios" },
  { value: "OTHER", label: "Otro" },
];

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-foreground";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseForm() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("OTHER");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(today());
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
          const result = await createExpense({
            description,
            category,
            amountCents: Math.round(value * 100),
            expenseDate,
          });
          if (result.ok) {
            setDescription("");
            setAmount("");
            toast.success("Gasto registrado");
          } else {
            toast.error(result.error ?? "No se pudo registrar");
          }
        });
      }}
      className="grid grid-cols-1 gap-2 rounded-2xl border border-border bg-surface p-3 sm:grid-cols-[1.4fr_1fr_110px_150px_44px] sm:items-center"
    >
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        placeholder="¿En qué gastaste? (ej. envío a cliente)"
        aria-label="Descripción del gasto"
        className={inputClass}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
        aria-label="Categoría"
        className={cn(inputClass, "cursor-pointer")}
      >
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        min="0"
        step="0.01"
        required
        placeholder="Monto"
        aria-label="Monto del gasto"
        className={inputClass}
      />
      <input
        value={expenseDate}
        onChange={(e) => setExpenseDate(e.target.value)}
        type="date"
        max={today()}
        aria-label="Fecha del gasto"
        className={cn(inputClass, "cursor-pointer")}
      />
      <button
        type="submit"
        disabled={pending}
        aria-label="Agregar gasto"
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors duration-200 hover:bg-gold-deep disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
      </button>
    </form>
  );
}

export function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await deleteExpense(expenseId);
          if (result.ok) toast.success("Gasto eliminado");
          else toast.error(result.error ?? "No se pudo eliminar");
        })
      }
      disabled={pending}
      aria-label="Eliminar gasto"
      title="Eliminar"
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
