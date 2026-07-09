import Link from "next/link";
import type { ShopOrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const filters: { value: ShopOrderStatus | "TODOS"; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "NEW", label: "Nuevos" },
  { value: "CONTACTED", label: "En contacto" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
];

type SearchParams = Promise<{ estado?: string }>;

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { estado } = await searchParams;
  const validStatus = filters.find((f) => f.value === estado && f.value !== "TODOS");

  const where: Prisma.ShopOrderWhereInput = validStatus
    ? { status: validStatus.value as ShopOrderStatus }
    : {};

  const [orders, counts] = await Promise.all([
    prisma.shopOrder.findMany({
      where,
      include: { items: true, user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.shopOrder.groupBy({ by: ["status"], _count: true }),
  ]);

  const total = counts.reduce((s, c) => s + c._count, 0);
  const countFor = (value: string) =>
    value === "TODOS" ? total : (counts.find((c) => c.status === value)?._count ?? 0);

  return (
    <section>
      <h2 className="mb-6 font-heading text-2xl uppercase tracking-tight">Pedidos</h2>

      {/* Filtros por estado */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active =
            filter.value === "TODOS" ? !validStatus : validStatus?.value === filter.value;
          return (
            <Link
              key={filter.value}
              href={
                filter.value === "TODOS"
                  ? "/admin/pedidos"
                  : `/admin/pedidos?estado=${filter.value}`
              }
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                active
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground"
              )}
            >
              {filter.label} ({countFor(filter.value)})
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
          No hay pedidos con este filtro.
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-3xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-accent">
                      {order.code}
                    </span>
                    <OrderStatusSelect orderId={order.id} status={order.status} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {order.customerName}
                    {order.user?.email ? ` · ${order.user.email}` : ""}
                    {order.customerPhone ? ` · ${order.customerPhone}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(order.totalCents)}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.createdAt.toLocaleString("es-MX", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.productName}
                    {item.variantName ? ` — ${item.variantName}` : ""} ·{" "}
                    {formatPrice(item.unitPriceCents * item.quantity)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
