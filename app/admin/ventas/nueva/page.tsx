import { prisma } from "@/lib/prisma";
import { SaleForm } from "@/components/admin/SaleForm";

export const dynamic = "force-dynamic";

export default async function NuevaVentaPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <section>
      <h2 className="mb-6 font-heading text-2xl uppercase tracking-tight">
        Registrar venta
      </h2>
      <SaleForm
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          priceCents: p.priceCents,
          variants: p.variants.map((v) => ({
            id: v.id,
            name: v.name,
            stock: v.stock,
            priceCents: v.priceCents,
          })),
        }))}
      />
    </section>
  );
}
