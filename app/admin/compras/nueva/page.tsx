import { prisma } from "@/lib/prisma";
import { PurchaseForm } from "@/components/admin/PurchaseForm";

export const dynamic = "force-dynamic";

export default async function NuevaCompraPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <section>
      <h2 className="mb-6 font-heading text-2xl uppercase tracking-tight">
        Registrar compra
      </h2>
      <PurchaseForm
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          costCents: p.costCents,
          variants: p.variants.map((v) => ({
            id: v.id,
            name: v.name,
            stock: v.stock,
          })),
        }))}
      />
    </section>
  );
}
