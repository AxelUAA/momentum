import Link from "next/link";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { EXPENSE_CATEGORIES } from "@/components/admin/ExpenseControls";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ desde?: string; hasta?: string }>;

function parseDate(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const d = new Date(`${value}T00:00:00`);
  return isNaN(d.getTime()) ? fallback : d;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function AdminResultadosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const from = parseDate(params.desde, monthStart);
  const toRaw = parseDate(params.hasta, now);
  // fin del día "hasta"
  const to = new Date(toRaw);
  to.setHours(23, 59, 59, 999);

  // Periodo anterior de la misma duración, para comparar
  const spanMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - spanMs);

  const range = { gte: from, lte: to };

  const [sales, expensesByCat, payments, prevSales, prevExpenses] =
    await Promise.all([
      prisma.sale.findMany({
        where: { status: { not: "CANCELLED" }, saleDate: range },
        select: { totalCents: true, costCents: true, saleDate: true },
      }),
      prisma.expense.groupBy({
        by: ["category"],
        _sum: { amountCents: true },
        where: { expenseDate: range },
      }),
      prisma.salePayment.aggregate({
        _sum: { amountCents: true },
        where: { paidAt: range, sale: { status: { not: "CANCELLED" } } },
      }),
      prisma.sale.aggregate({
        _sum: { totalCents: true, costCents: true },
        where: {
          status: { not: "CANCELLED" },
          saleDate: { gte: prevFrom, lte: prevTo },
        },
      }),
      prisma.expense.aggregate({
        _sum: { amountCents: true },
        where: { expenseDate: { gte: prevFrom, lte: prevTo } },
      }),
    ]);

  const totalSales = sales.reduce((s, v) => s + v.totalCents, 0);
  const totalCost = sales.reduce((s, v) => s + v.costCents, 0);
  const totalExpenses = expensesByCat.reduce(
    (s, e) => s + (e._sum.amountCents ?? 0),
    0
  );
  const grossProfit = totalSales - totalCost;
  const netProfit = grossProfit - totalExpenses;
  const collected = payments._sum.amountCents ?? 0;

  const prevNet =
    (prevSales._sum.totalCents ?? 0) -
    (prevSales._sum.costCents ?? 0) -
    (prevExpenses._sum.amountCents ?? 0);
  const netDelta = netProfit - prevNet;

  // Ventas por día (barras)
  const byDay = new Map<string, number>();
  for (const sale of sales) {
    const key = iso(sale.saleDate);
    byDay.set(key, (byDay.get(key) ?? 0) + sale.totalCents);
  }
  const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
  const maxDay = Math.max(1, ...days.map(([, v]) => v));

  const categoryLabel = (value: string) =>
    EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? value;

  const quickRanges = [
    { label: "Este mes", desde: iso(monthStart), hasta: iso(now) },
    {
      label: "Mes pasado",
      desde: iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      hasta: iso(new Date(now.getFullYear(), now.getMonth(), 0)),
    },
    {
      label: "Últimos 7 días",
      desde: iso(new Date(now.getTime() - 6 * 86400000)),
      hasta: iso(now),
    },
  ];

  const exportQuery = `desde=${iso(from)}&hasta=${iso(toRaw)}`;

  const rows = [
    { label: "Ventas del periodo", value: totalSales, sign: "+" },
    { label: "Costo de la mercancía vendida", value: -totalCost, sign: "-" },
    { label: "Ganancia bruta", value: grossProfit, strong: true },
    { label: "Gastos", value: -totalExpenses, sign: "-" },
  ];

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl uppercase tracking-tight">
          Resultados
        </h2>
        <div className="flex gap-2">
          <a
            href={`/admin/export?tipo=ventas&${exportQuery}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors duration-200 hover:border-foreground"
          >
            <Download className="h-3.5 w-3.5" /> Ventas CSV
          </a>
          <a
            href={`/admin/export?tipo=gastos&${exportQuery}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors duration-200 hover:border-foreground"
          >
            <Download className="h-3.5 w-3.5" /> Gastos CSV
          </a>
        </div>
      </div>

      {/* Selector de periodo */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {quickRanges.map((r) => {
          const active = iso(from) === r.desde && iso(toRaw) === r.hasta;
          return (
            <Link
              key={r.label}
              href={`/admin/resultados?desde=${r.desde}&hasta=${r.hasta}`}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                active
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </Link>
          );
        })}
        <form className="ml-auto flex items-center gap-2" action="/admin/resultados">
          <input
            type="date"
            name="desde"
            defaultValue={iso(from)}
            aria-label="Desde"
            className="h-10 cursor-pointer rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
          />
          <span className="text-sm text-muted-foreground">a</span>
          <input
            type="date"
            name="hasta"
            defaultValue={iso(toRaw)}
            aria-label="Hasta"
            className="h-10 cursor-pointer rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
          />
          <button
            type="submit"
            className="h-10 cursor-pointer rounded-full border border-border px-4 text-sm font-semibold transition-colors duration-200 hover:border-foreground"
          >
            Aplicar
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Estado de resultados */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Estado de resultados ({sales.length}{" "}
            {sales.length === 1 ? "venta" : "ventas"})
          </h3>
          <ul className="mt-4 divide-y divide-border">
            {rows.map((row) => (
              <li
                key={row.label}
                className={cn(
                  "flex items-center justify-between py-3",
                  row.strong && "font-semibold"
                )}
              >
                <span className="text-sm">{row.label}</span>
                <span className={cn("text-sm", row.value < 0 && "text-muted-foreground")}>
                  {row.value < 0 ? `− ${formatPrice(-row.value)}` : formatPrice(row.value)}
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between py-4">
              <span className="font-bold">Utilidad neta</span>
              <span
                className={cn(
                  "font-heading text-2xl tracking-tight",
                  netProfit < 0 && "text-destructive"
                )}
              >
                {formatPrice(netProfit)}
              </span>
            </li>
          </ul>

          <div className="mt-2 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm">
            {netDelta >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-muted-foreground">
              {netDelta >= 0 ? "+" : "−"}
              {formatPrice(Math.abs(netDelta))} vs periodo anterior
            </span>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Efectivo cobrado en el periodo (incluye abonos):{" "}
            <span className="font-semibold text-foreground">
              {formatPrice(collected)}
            </span>
          </p>
        </div>

        <div className="space-y-6">
          {/* Ventas por día */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Ventas por día
            </h3>
            {days.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Sin ventas en el periodo.
              </p>
            ) : (
              <div className="mt-4 flex h-32 items-end gap-1">
                {days.map(([day, value]) => (
                  <div
                    key={day}
                    className="group relative flex-1 rounded-t-md bg-foreground/80 transition-colors duration-200 hover:bg-foreground"
                    style={{ height: `${Math.max(6, (value / maxDay) * 100)}%` }}
                    title={`${day}: ${formatPrice(value)}`}
                  />
                ))}
              </div>
            )}
            {days.length > 0 && (
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{days[0][0].slice(5)}</span>
                <span>{days[days.length - 1][0].slice(5)}</span>
              </div>
            )}
          </div>

          {/* Gastos por categoría */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Gastos por categoría
            </h3>
            {expensesByCat.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Sin gastos en el periodo.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {expensesByCat
                  .slice()
                  .sort(
                    (a, b) => (b._sum.amountCents ?? 0) - (a._sum.amountCents ?? 0)
                  )
                  .map((e) => (
                    <li
                      key={e.category}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{categoryLabel(e.category)}</span>
                      <span className="font-semibold">
                        {formatPrice(e._sum.amountCents ?? 0)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
