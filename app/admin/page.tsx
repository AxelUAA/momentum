import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  PackageOpen,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; className: string }> = {
  NEW: { label: "Nuevo", className: "bg-accent/15 text-accent" },
  CONTACTED: { label: "En contacto", className: "bg-sky-500/15 text-sky-400" },
  CONFIRMED: { label: "Confirmado", className: "bg-violet-500/15 text-violet-400" },
  DELIVERED: { label: "Entregado", className: "bg-emerald-500/15 text-emerald-400" },
  CANCELLED: { label: "Cancelado", className: "bg-red-500/15 text-red-400" },
};

export default async function AdminDashboardPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    newOrders,
    monthSales,
    activeProducts,
    outOfStock,
    recentOrders,
    topItems,
  ] = await Promise.all([
    prisma.shopOrder.count({ where: { status: "NEW" } }),
    prisma.shopOrder.aggregate({
      _sum: { totalCents: true },
      _count: true,
      where: { status: { not: "CANCELLED" }, createdAt: { gte: monthStart } },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.count({
      where: { isActive: true, stock: { lte: 0 }, product: { isActive: true } },
    }),
    prisma.shopOrder.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.shopOrderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true },
      where: { order: { status: { not: "CANCELLED" } } },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const kpis = [
    {
      icon: PackageOpen,
      label: "Pedidos nuevos",
      value: String(newOrders),
      hint: "por atender",
      href: "/admin/pedidos?estado=NEW",
    },
    {
      icon: Banknote,
      label: "Ventas del mes",
      value: formatPrice(monthSales._sum.totalCents ?? 0),
      hint: `${monthSales._count} pedidos`,
      href: "/admin/pedidos",
    },
    {
      icon: ShoppingBag,
      label: "Productos activos",
      value: String(activeProducts),
      hint: "visibles en tienda",
      href: "/admin/productos",
    },
    {
      icon: TriangleAlert,
      label: "Variantes sin stock",
      value: String(outOfStock),
      hint: "requieren resurtido",
      href: "/admin/productos",
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
            className="group rounded-3xl border border-border bg-card p-6 transition-colors duration-200 hover:border-accent/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10">
              <kpi.icon className="h-5 w-5 text-accent" />
            </div>
            <p className="mt-4 font-heading text-3xl tracking-tight">{kpi.value}</p>
            <p className="mt-1 text-sm font-semibold">{kpi.label}</p>
            <p className="text-xs text-muted-foreground">{kpi.hint}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        {/* Pedidos recientes */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-2xl uppercase tracking-tight">
              Pedidos recientes
            </h2>
            <Link
              href="/admin/pedidos"
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-accent"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
              Aún no hay pedidos. Cuando alguien pida por WhatsApp aparecerá aquí.
            </div>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((order) => {
                const status = statusLabels[order.status] ?? statusLabels.NEW;
                return (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-accent">
                        {order.code}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                      <span className="hidden text-sm text-muted-foreground sm:inline">
                        {order.customerName} ·{" "}
                        {order.items.reduce((s, i) => s + i.quantity, 0)} artículos
                      </span>
                    </div>
                    <span className="font-bold">{formatPrice(order.totalCents)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Top productos */}
        <section>
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
                  <span className="font-heading text-xl text-accent">{i + 1}</span>
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
