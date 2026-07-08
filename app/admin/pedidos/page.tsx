import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const orders = await prisma.shopOrder.findMany({
    include: { items: true, user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <section>
      <h2 className="mb-6 font-heading text-2xl uppercase tracking-tight">
        Pedidos ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
          Aún no hay pedidos registrados.
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
