import Link from "next/link";
import { MessageCircle, Search, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { getProducts } from "@/lib/products";
import { BRAND } from "@/lib/brand";
import { WHATSAPP_PHONE } from "@/lib/whatsapp";

export const revalidate = 120;

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      {/* ─── Encabezado ───────────────────────────────── */}
      <section className="border-b border-border px-6 pb-12 pt-32 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Catálogo · Solo mayores de 18 años
          </p>
          <h1 className="mt-3 font-heading text-4xl uppercase tracking-tight md:text-6xl">
            {BRAND.name}
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Vapes 100% originales con stock real. Mira lo disponible y pide
            directo por WhatsApp.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors duration-200 hover:bg-gold-deep"
            >
              <MessageCircle className="h-4 w-4" />
              Pedir por WhatsApp
            </a>
            <Link
              href="/productos"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-bold uppercase tracking-wide transition-colors duration-200 hover:border-foreground"
            >
              <Search className="h-4 w-4" />
              Buscar en el catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Productos disponibles ────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-heading text-2xl uppercase tracking-tight">
            Disponible ahora
          </h2>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── Cómo comprar ─────────────────────────────── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="font-heading text-2xl uppercase tracking-tight">
            ¿Cómo comprar?
          </h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            <li className="flex gap-4">
              <span className="font-heading text-3xl text-muted-foreground">1</span>
              <div>
                <p className="font-semibold">Elige tu vape</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Revisa el catálogo: lo que ves disponible es stock real.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="font-heading text-3xl text-muted-foreground">2</span>
              <div>
                <p className="font-semibold">Mándalo por WhatsApp</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Agrega al carrito y envía el pedido, o escríbenos directo.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="font-heading text-3xl text-muted-foreground">3</span>
              <div>
                <p className="font-semibold">Coordinamos la entrega</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Acordamos pago y entrega en tu zona. También manejamos apartados
                  y pagos a plazos.
                </p>
              </div>
            </li>
          </ol>

          <p className="mt-10 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Producto con nicotina, sustancia adictiva. Venta exclusiva para
            mayores de 18 años.
          </p>
        </div>
      </section>
    </>
  );
}
