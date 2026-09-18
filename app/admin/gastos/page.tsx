import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import {
  DeleteExpenseButton,
  ExpenseForm,
  EXPENSE_CATEGORIES,
} from "@/components/admin/ExpenseControls";

export const dynamic = "force-dynamic";

export default async function AdminGastosPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [expenses, monthTotal] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { expenseDate: "desc" },
      take: 100,
    }),
    prisma.expense.aggregate({
      _sum: { amountCents: true },
      where: { expenseDate: { gte: monthStart } },
    }),
  ]);

  const categoryLabel = (value: string) =>
    EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? value;

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-heading text-2xl uppercase tracking-tight">Gastos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gastado este mes:{" "}
          <span className="font-semibold text-foreground">
            {formatPrice(monthTotal._sum.amountCents ?? 0)}
          </span>
        </p>
      </div>

      <ExpenseForm />

      {expenses.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
          Sin gastos registrados. Captura aquí todo lo que sale del negocio
          (envíos, gasolina, empaque...) para que Resultados muestre tu utilidad
          real.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-3xl border border-border bg-card px-5">
          {expenses.map((expense) => (
            <li
              key={expense.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {expense.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {categoryLabel(expense.category)} ·{" "}
                  {expense.expenseDate.toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {formatPrice(expense.amountCents)}
                </span>
                <DeleteExpenseButton expenseId={expense.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
