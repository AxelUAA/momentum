import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Droplets, Battery, Wind, Gauge } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AddToCart } from "@/components/store/AddToCart";
import { FavoriteButton } from "@/components/store/FavoriteButton";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductCard } from "@/components/store/ProductCard";
import { formatPrice, formatPuffs } from "@/lib/format";
import {
  getProductBySlug,
  getRelatedProducts,
  productImages,
} from "@/lib/products";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado | Momentum" };
  return {
    title: `${product.name} | Momentum`,
    description: product.description ?? undefined,
  };
}

export default async function ProductoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  const related = await getRelatedProducts(product, 4);
  const session = await auth();
  const favorite = session?.user?.id
    ? await prisma.favorite.findUnique({
        where: {
          userId_productId: { userId: session.user.id, productId: product.id },
        },
      })
    : null;
  const images = productImages(product);
  const hasDiscount =
    product.compareAtCents != null && product.compareAtCents > product.priceCents;

  const specs = [
    product.puffs && {
      icon: Wind,
      label: "Puffs",
      value: formatPuffs(product.puffs).replace(" puffs", ""),
    },
    product.nicotineMg != null && {
      icon: Gauge,
      label: "Nicotina",
      value: `${product.nicotineMg} mg/ml`,
    },
    product.volumeMl != null && {
      icon: Droplets,
      label: "Líquido",
      value: `${product.volumeMl} ml`,
    },
    product.batteryMah != null && {
      icon: Battery,
      label: "Batería",
      value: `${product.batteryMah} mAh`,
    },
  ].filter(Boolean) as { icon: typeof Wind; label: string; value: string }[];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-32">
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="mb-8 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/productos" className="transition-colors duration-200 hover:text-foreground">
          Catálogo
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/productos?categoria=${product.category.slug}`}
              className="transition-colors duration-200 hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Galería */}
        <ProductGallery
          images={images}
          name={product.name}
          badge={
            hasDiscount ? (
              <span className="absolute left-4 top-4 rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase text-accent-foreground">
                Oferta
              </span>
            ) : undefined
          }
        />

        {/* Info */}
        <div>
          {product.brand && (
            <Link
              href={`/productos?marca=${product.brand.slug}`}
              className="text-sm font-semibold uppercase tracking-widest text-accent transition-colors duration-200 hover:text-gold-deep"
            >
              {product.brand.name}
            </Link>
          )}
          <h1 className="mt-2 font-heading text-4xl uppercase tracking-tight md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              {formatPrice(product.priceCents)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtCents!)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {/* Specs */}
          {specs.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-2xl border border-border bg-card p-4 text-center"
                >
                  <spec.icon className="mx-auto h-5 w-5 text-accent" />
                  <p className="mt-2 text-sm font-bold">{spec.value}</p>
                  <p className="text-xs text-muted-foreground">{spec.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-start gap-3">
            {session && (
              <FavoriteButton
                productId={product.id}
                initialFavorited={!!favorite}
              />
            )}
            <div className="flex-1">
              <AddToCart
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                image: images[0] ?? null,
              }}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                priceCents: v.priceCents,
                stock: v.stock,
              }))}
              />
            </div>
          </div>

          <p className="mt-8 rounded-2xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground">18+</span> · Producto
            con nicotina, sustancia adictiva. Venta exclusiva para mayores de
            edad.
          </p>
        </div>
      </div>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-heading text-3xl uppercase tracking-tight">
            También te puede gustar
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
