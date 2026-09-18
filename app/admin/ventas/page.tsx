import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";
import type { Prisma, SaleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { whatsappLinkTo } from "@/lib/whatsapp";
import { BRAND } from "@/lib/brand";
import {
  CancelSaleButton,
  SalePaymentForm,
} from "@/components/admin/SaleRowActions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const filters: { value: SaleStatus | "TODAS"; label: string }[] = [
  { value: "TODAS", label: "Todas" },
  { value: "OPEN", label: "Por cobrar" },
  { value: "PAID", label: "Pagadas" },
  { value: "CANCELLED", label: "Canceladas" },
];

const statusBadge: Record<SaleStatus, { label: string; className: string }> = {
  OPEN: { label: "Por cobrar", className: "bg-foreground text-background" },
  PAID: { label: "Pagada", className: "bg-muted text-foreground" },
  CANCELLED: {
    label: "Cancelada",
    className: "bg-muted text-muted-foreground line-through",
  },
};

type SearchParams = Promise<{ estado?: string }>;

export default async function AdminVentasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { estado } = await searchParams;
  const validStatus = filters.find(
    (f) => f.value === estado && f.value !== "TODAS"
  );

  const where: Prisma.SaleWhereInput = validStatus
    ? { status: validStatus.value as SaleStatus }
    : {};

  const [sales, counts] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: { items: true, payments: { orderBy: { paidAt: "asc" } } },
      orderBy: { saleDate: "desc" },
      take: 100,
    }),
    prisma.sale.groupBy({ by: ["status"], _count: true }),
  ]);

  const total = counts.reduce((s, c) => s + c._count, 0);
  const countFor = (value: string) =>
    value === "TODAS"
      ? total
      : (counts.find((c) => c.status === value)?._count ?? 0);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl uppercase tracking-tight">Ventas</h2>
        <Link
          href="/admin/ventas/nueva"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors duration-200 hover:bg-gold-deep"
        >
          <Plus className="h-4 w-4" /> Registrar venta
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active =
            filter.value === "TODAS"
              ? !validStatus
              : validStatus?.value === filter.value;
          return (
            <Link
              key={filter.value}
              href={
                filter.value === "TODAS"
                  ? "/admin/ventas"
                  : `/admin/ventas?estado=${filter.value}`
              }
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                active
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              {filter.label} ({countFor(filter.value)})
            </Link>
          );
        })}
      </div>

      {sales.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
          No hay ventas con este filtro. Registra la primera con el botón de
          arriba.
        </div>
      ) : (
        <ul className="space-y-4">
          {sales.map((sale) => {
            const paid = sale.payments.reduce((s, p) => s + p.amountCents, 0);
            const balance = sale.totalCents - paid;
            const badge = statusBadge[sale.status];
            return (
              <li
                key={sale.id}
                className="rounded-3xl border border-border bg-card p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm font-bold">
                        {sale.code}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {sale.type === "CASH" ? "Contado" : "A plazos"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {sale.customerName}
                      {sale.customerPhone ? ` · ${sale.customerPhone}` : ""} ·{" "}
                      {sale.saleDate.toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(sale.totalCents)}</p>
                    {sale.status === "OPEN" && (
                      <p className="text-xs text-muted-foreground">
                        Pagado {formatPrice(paid)} · Resta{" "}
                        <span className="font-semibold text-foreground">
                          {formatPrice(balance)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <ul className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
                  {sale.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}x {item.productName}
                      {item.variantName ? ` — ${item.variantName}` : ""} ·{" "}
                      {formatPrice(item.unitPriceCents * item.quantity)}
                    </li>
                  ))}
                  {sale.notes && (
                    <li className="pt-1 text-xs italic">Nota: {sale.notes}</li>
                  )}
                </ul>

                {sale.payments.length > 0 && sale.type === "INSTALLMENTS" && (
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Abonos ({sale.payments.length})
                    </summary>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      {sale.payments.map((p) => (
                        <li key={p.id}>
                          {p.paidAt.toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          · {formatPrice(p.amountCents)}
                          {p.note ? ` — ${p.note}` : ""}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {sale.status !== "CANCELLED" && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    {sale.status === "OPEN" ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <SalePaymentForm saleId={sale.id} />
                        {sale.customerPhone &&
                          (() => {
                            const reminder = whatsappLinkTo(
                              sale.customerPhone,
                              `Hola ${sale.customerName}, te saluda ${BRAND.name} 👋 Te recordamos el saldo de tu compra ${sale.code}: restan ${formatPrice(balance)} de ${formatPrice(sale.totalCents)}. ¿Cuándo te queda bien abonar?`
                            );
                            return reminder ? (
                              <a
                                href={reminder}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-xs font-semibold transition-colors duration-200 hover:border-foreground"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Recordar pago
                              </a>
                            ) : null;
                          })()}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Liquidada
                      </span>
                    )}
                    <CancelSaleButton saleId={sale.id} code={sale.code} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
