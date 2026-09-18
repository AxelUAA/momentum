import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  HandCoins,
  PackageOpen,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [monthSales, monthExpenses, lowStock, openSales, newOrders, recentSales, topItems] =
    await Promise.all([
      prisma.sale.aggregate({
        _sum: { totalCents: true, costCents: true },
        _count: true,
        where: { status: { not: "CANCELLED" }, saleDate: { gte: monthStart } },
      }),
      prisma.expense.aggregate({
        _sum: { amountCents: true },
        where: { expenseDate: { gte: monthStart } },
      }),
      prisma.productVariant.findMany({
        where: { isActive: true, stock: { lte: 5 }, product: { isActive: true } },
        include: { product: { select: { name: true, id: true } } },
        orderBy: { stock: "asc" },
        take: 8,
      }),
      prisma.sale.findMany({
        where: { status: "OPEN" },
        include: { payments: true },
      }),
      prisma.shopOrder.count({ where: { status: "NEW" } }),
      prisma.sale.findMany({
        where: { status: { not: "CANCELLED" } },
        include: { payments: true, items: true },
        orderBy: { saleDate: "desc" },
        take: 5,
      }),
      prisma.saleItem.groupBy({
        by: ["productName"],
        _sum: { quantity: true },
        where: { sale: { status: { not: "CANCELLED" } } },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

  const monthTotal = monthSales._sum.totalCents ?? 0;
  const monthProfit =
    monthTotal -
    (monthSales._sum.costCents ?? 0) -
    (monthExpenses._sum.amountCents ?? 0);
  const receivable = openSales.reduce(
    (s, sale) =>
      s + sale.totalCents - sale.payments.reduce((p, pay) => p + pay.amountCents, 0),
    0
  );

  const kpis = [
    {
      icon: Banknote,
      label: "Ventas del mes",
      value: formatPrice(monthTotal),
      hint: `${monthSales._count} ${monthSales._count === 1 ? "venta" : "ventas"}`,
      href: "/admin/ventas",
    },
    {
      icon: TrendingUp,
      label: "Utilidad del mes",
      value: formatPrice(monthProfit),
      hint: "ventas − costo − gastos",
      href: "/admin/resultados",
    },
    {
      icon: HandCoins,
      label: "Por cobrar",
      value: formatPrice(receivable),
      hint: `${openSales.length} ${openSales.length === 1 ? "venta a plazos" : "ventas a plazos"}`,
      href: "/admin/ventas?estado=OPEN",
    },
    {
      icon: PackageOpen,
      label: "Pedidos WhatsApp",
      value: String(newOrders),
      hint: "nuevos por atender",
      href: "/admin/pedidos?estado=NEW",
    },
  ];

  return (
    <div className="space-y-10">
      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="group rounded-3xl border border-border bg-card p-6 transition-colors duration-200 hover:border-foreground"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
              <kpi.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 font-heading text-3xl tracking-tight">{kpi.value}</p>
            <p className="mt-1 text-sm font-semibold">{kpi.label}</p>
            <p className="text-xs text-muted-foreground">{kpi.hint}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        {/* Ventas recientes */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-2xl uppercase tracking-tight">
              Ventas recientes
            </h2>
            <Link
              href="/admin/ventas"
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
              Aún no registras ventas.{" "}
              <Link href="/admin/ventas/nueva" className="font-semibold underline">
                Registra la primera
              </Link>
              .
            </div>
          ) : (
            <ul className="space-y-3">
              {recentSales.map((sale) => {
                const paid = sale.payments.reduce((s, p) => s + p.amountCents, 0);
                const balance = sale.totalCents - paid;
                return (
                  <li
                    key={sale.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold">{sale.code}</span>
                      <span className="text-sm text-muted-foreground">
                        {sale.customerName} ·{" "}
                        {sale.items.reduce((s, i) => s + i.quantity, 0)} art.
                      </span>
                      {sale.status === "OPEN" && (
                        <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
                          Resta {formatPrice(balance)}
                        </span>
                      )}
                    </div>
                    <span className="font-bold">{formatPrice(sale.totalCents)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Más vendidos + resurtido */}
        <section>
          {lowStock.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 font-heading text-2xl uppercase tracking-tight">
                Resurtir pronto
              </h2>
              <ul className="overflow-hidden rounded-3xl border border-border bg-card">
                {lowStock.map((variant) => (
                  <li
                    key={variant.id}
                    className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 last:border-0"
                  >
                    <Link
                      href={`/admin/productos/${variant.product.id}`}
                      className="min-w-0 flex-1 truncate text-sm font-medium transition-colors duration-200 hover:underline"
                    >
                      {variant.product.name}{" "}
                      <span className="text-muted-foreground">— {variant.name}</span>
                    </Link>
                    <span
                      className={
                        variant.stock <= 0
                          ? "rounded-full bg-foreground px-2.5 py-0.5 text-xs font-bold text-background"
                          : "text-sm font-semibold"
                      }
                    >
                      {variant.stock <= 0 ? "Agotado" : `${variant.stock} pzas`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="mb-4 font-heading text-2xl uppercase tracking-tight">
            Más vendidos
          </h2>
          {topItems.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
              Sin datos todavía.
            </div>
          ) : (
            <ol className="overflow-hidden rounded-3xl border border-border bg-card">
              {topItems.map((item, i) => (
                <li
                  key={item.productName}
                  className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0"
                >
                  <span className="font-heading text-xl text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {item.productName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item._sum.quantity} uds
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
