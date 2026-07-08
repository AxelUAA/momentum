import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Heart, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Mi cuenta | Momentum" };

const statusLabels: Record<string, { label: string; className: string }> = {
  NEW: { label: "Nuevo", className: "bg-accent/15 text-accent" },
  CONTACTED: { label: "En contacto", className: "bg-sky-500/15 text-sky-400" },
  CONFIRMED: { label: "Confirmado", className: "bg-violet-500/15 text-violet-400" },
  DELIVERED: { label: "Entregado", className: "bg-emerald-500/15 text-emerald-400" },
  CANCELLED: { label: "Cancelado", className: "bg-red-500/15 text-red-400" },
};

export default async function CuentaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/cuenta");

  const [orders, favorites] = await Promise.all([
    prisma.shopOrder.findMany({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Hola, {session.user.name?.split(" ")[0] ?? "cliente"}
          </p>
          <h1 className="mt-2 font-heading text-4xl uppercase tracking-tight md:text-5xl">
            Mi cuenta
          </h1>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:border-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* Pedidos */}
      <section>
        <div className="mb-5 flex items-center gap-2">
          <Package className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-2xl uppercase tracking-tight">
            Mis pedidos
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <p className="font-semibold">Aún no tienes pedidos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando pidas por WhatsApp con tu sesión iniciada, aparecerán aquí.
            </p>
            <Link
              href="/productos"
              className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-accent-foreground transition-colors duration-200 hover:bg-gold-deep"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => {
              const status = statusLabels[order.status] ?? statusLabels.NEW;
              return (
                <li
                  key={order.id}
                  className="rounded-3xl border border-border bg-card p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-accent">
                        {order.code}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {order.createdAt.toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="font-bold">{formatPrice(order.totalCents)}</span>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.productName}
                        {item.variantName ? ` — ${item.variantName}` : ""}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Favoritos */}
      <section className="mt-16">
        <div className="mb-5 flex items-center gap-2">
          <Heart className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-2xl uppercase tracking-tight">
            Favoritos
          </h2>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <p className="font-semibold">Sin favoritos todavía</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Marca productos con el corazón para tenerlos a la mano.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => (
              <ProductCard key={fav.id} product={fav.product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
