import { MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { whatsappLinkTo } from "@/lib/whatsapp";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

type CustomerRow = {
  name: string;
  phone: string | null;
  purchases: number;
  totalCents: number;
  balanceCents: number;
  openSaleCodes: string[];
  lastDate: Date;
};

export default async function AdminClientesPage() {
  const sales = await prisma.sale.findMany({
    where: { status: { not: "CANCELLED" } },
    include: { payments: true },
    orderBy: { saleDate: "desc" },
  });

  // Agrupar por teléfono (si hay) o por nombre normalizado
  const customers = new Map<string, CustomerRow>();
  for (const sale of sales) {
    const key = sale.customerPhone?.replace(/\D/g, "") || sale.customerName.trim().toLowerCase();
    const paid = sale.payments.reduce((s, p) => s + p.amountCents, 0);
    const balance = sale.status === "OPEN" ? sale.totalCents - paid : 0;

    const existing = customers.get(key);
    if (existing) {
      existing.purchases += 1;
      existing.totalCents += sale.totalCents;
      existing.balanceCents += balance;
      if (balance > 0) existing.openSaleCodes.push(sale.code);
      if (sale.saleDate > existing.lastDate) existing.lastDate = sale.saleDate;
      if (!existing.phone && sale.customerPhone) existing.phone = sale.customerPhone;
    } else {
      customers.set(key, {
        name: sale.customerName,
        phone: sale.customerPhone,
        purchases: 1,
        totalCents: sale.totalCents,
        balanceCents: balance,
        openSaleCodes: balance > 0 ? [sale.code] : [],
        lastDate: sale.saleDate,
      });
    }
  }

  const rows = [...customers.values()].sort(
    (a, b) => b.balanceCents - a.balanceCents || b.totalCents - a.totalCents
  );
  const totalReceivable = rows.reduce((s, r) => s + r.balanceCents, 0);

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-heading text-2xl uppercase tracking-tight">Clientes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? "cliente" : "clientes"} · Por cobrar
          en total:{" "}
          <span className="font-semibold text-foreground">
            {formatPrice(totalReceivable)}
          </span>
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
          Aquí aparecerán tus clientes conforme registres ventas con su nombre y
          teléfono.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-4 font-semibold">Cliente</th>
                <th className="px-5 py-4 font-semibold">Compras</th>
                <th className="px-5 py-4 font-semibold">Total comprado</th>
                <th className="px-5 py-4 font-semibold">Debe</th>
                <th className="px-5 py-4 text-right font-semibold">Cobranza</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((customer) => {
                const reminder =
                  customer.phone && customer.balanceCents > 0
                    ? whatsappLinkTo(
                        customer.phone,
                        `Hola ${customer.name}, te saluda ${BRAND.name} 👋 Te recordamos tu saldo pendiente de ${formatPrice(customer.balanceCents)} (${customer.openSaleCodes.join(", ")}). ¿Cuándo te queda bien abonar?`
                      )
                    : null;
                return (
                  <tr
                    key={`${customer.name}-${customer.phone}`}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.phone ?? "Sin teléfono"} · Última compra{" "}
                        {customer.lastDate.toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {customer.purchases}
                    </td>
                    <td className="px-5 py-3">{formatPrice(customer.totalCents)}</td>
                    <td className="px-5 py-3">
                      {customer.balanceCents > 0 ? (
                        <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
                          {formatPrice(customer.balanceCents)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        {reminder ? (
                          <a
                            href={reminder}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors duration-200 hover:border-foreground"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Recordar pago
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
