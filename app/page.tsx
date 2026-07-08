import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, Truck, Zap } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { getBrands, getFeaturedProducts } from "@/lib/products";
import { WHATSAPP_PHONE } from "@/lib/whatsapp";

export const revalidate = 300;

export default async function HomePage() {
  const [featured, brands] = await Promise.all([
    getFeaturedProducts(4),
    getBrands(),
  ]);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-20 pt-40 md:pb-28 md:pt-48">
        {/* Glow de fondo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(245,185,66,0.14), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mx-auto mb-6 w-fit rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            100% originales · Pedido por WhatsApp
          </p>
          <h1 className="font-heading text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
            El siguiente nivel
            <br />
            <span className="text-accent">del vapeo</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Desechables y pods de las marcas que importan: ELFBAR, Lost Mary,
            Geek Bar y más. Sabores reales, stock real.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/productos"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-bold uppercase tracking-wide text-accent-foreground transition-colors duration-200 hover:bg-gold-deep"
            >
              Ver catálogo
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-4 text-sm font-bold uppercase tracking-wide transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ─── Marquee de marcas ────────────────────────── */}
      {brands.length > 0 && (
        <section className="overflow-hidden border-y border-border bg-card py-5">
          <div className="animate-marquee flex w-max items-center gap-16 pr-16">
            {[...brands, ...brands, ...brands, ...brands].map((brand, i) => (
              <span
                key={`${brand.id}-${i}`}
                className="font-heading text-2xl uppercase tracking-wider text-muted-foreground"
              >
                {brand.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ─── Destacados ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Lo más pedido
            </p>
            <h2 className="mt-2 font-heading text-3xl uppercase tracking-tight md:text-5xl">
              Destacados
            </h2>
          </div>
          <Link
            href="/productos"
            className="hidden items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-accent sm:inline-flex"
          >
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── Categorías ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/productos?categoria=desechables"
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-10 transition-colors duration-200 hover:border-accent/50"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 80% 20%, rgba(245,185,66,0.10), transparent 70%)",
              }}
            />
            <p className="font-heading text-4xl uppercase tracking-tight md:text-5xl">
              Desechables
            </p>
            <p className="mt-3 max-w-sm text-muted-foreground">
              De 5,000 a 40,000 puffs. Ábrelo y listo — sin cargas, sin
              recambios.
            </p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent">
              Explorar{" "}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href="/productos?categoria=pods-recargables"
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-10 transition-colors duration-200 hover:border-accent/50"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 80% 20%, rgba(245,185,66,0.10), transparent 70%)",
              }}
            />
            <p className="font-heading text-4xl uppercase tracking-tight md:text-5xl">
              Pods recargables
            </p>
            <p className="mt-3 max-w-sm text-muted-foreground">
              Batería recargable y costo por puff mucho menor. Para el día a
              día.
            </p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent">
              Explorar{" "}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* ─── Value props ──────────────────────────────── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-3">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
              <ShieldCheck className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold">100% originales</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Producto verificado de distribuidores oficiales. Cero clones.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
              <MessageCircle className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold">Atención directa</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pides por WhatsApp y te respondemos al momento, sin bots.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
              <Truck className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold">Entrega rápida</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Coordinamos la entrega en tu zona el mismo día cuando es
                posible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA final ────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(245,185,66,0.12), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <Zap className="mx-auto h-10 w-10 text-accent" />
          <h2 className="mt-6 font-heading text-4xl uppercase tracking-tight md:text-6xl">
            ¿Listo para pedir?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
            Arma tu carrito y mándalo por WhatsApp. Confirmamos stock, entrega
            y pago en minutos.
          </p>
          <Link
            href="/productos"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-bold uppercase tracking-wide text-accent-foreground transition-colors duration-200 hover:bg-gold-deep"
          >
            Ver catálogo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
