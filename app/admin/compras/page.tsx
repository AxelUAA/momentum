import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminComprasPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [purchases, monthTotal] = await Promise.all([
    prisma.purchase.findMany({
      include: { items: true },
      orderBy: { purchaseDate: "desc" },
      take: 50,
    }),
    prisma.purchase.aggregate({
      _sum: { totalCents: true },
      where: { purchaseDate: { gte: monthStart } },
    }),
  ]);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl uppercase tracking-tight">
            Compras / resurtidos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Invertido este mes:{" "}
            <span className="font-semibold text-foreground">
              {formatPrice(monthTotal._sum.totalCents ?? 0)}
            </span>
          </p>
        </div>
        <Link
          href="/admin/compras/nueva"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors duration-200 hover:bg-gold-deep"
        >
          <Plus className="h-4 w-4" /> Registrar compra
        </Link>
      </div>

      {purchases.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
          Sin compras registradas. Cuando te llegue mercancía, regístrala aquí
          para subir el stock y guardar el costo.
        </div>
      ) : (
        <ul className="space-y-4">
          {purchases.map((purchase) => (
            <li
              key={purchase.id}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-sm font-bold">
                    {purchase.code}
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {purchase.purchaseDate.toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {purchase.supplier ? ` · ${purchase.supplier}` : ""}
                  </p>
                </div>
                <span className="font-bold">{formatPrice(purchase.totalCents)}</span>
              </div>
              <ul className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
                {purchase.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.productName}
                    {item.variantName ? ` — ${item.variantName}` : ""} ·{" "}
                    {formatPrice(item.unitCostCents)} c/u
                  </li>
                ))}
                {purchase.notes && (
                  <li className="pt-1 text-xs italic">Nota: {purchase.notes}</li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
