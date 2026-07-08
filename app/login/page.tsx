import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgePercent,
  Heart,
  Package,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { auth, signIn } from "@/auth";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Iniciar sesión | ${BRAND.name}`,
};

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

const benefits = [
  {
    icon: Package,
    title: "Historial de pedidos",
    description: "Cada pedido queda guardado con su código y estado en tiempo real.",
  },
  {
    icon: Heart,
    title: "Tus favoritos, sincronizados",
    description: "Guarda sabores y equipos para pedirlos de nuevo en dos toques.",
  },
  {
    icon: Zap,
    title: "Pedidos más rápidos",
    description: "Tu nombre va prellenado al pedir por WhatsApp. Cero fricción.",
  },
  {
    icon: BadgePercent,
    title: "Acceso a drops y ofertas",
    description: "Los lanzamientos y descuentos se anuncian primero a clientes.",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  if (session) {
    redirect(callbackUrl ?? "/");
  }

  const redirectTo = callbackUrl ?? "/";

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-16 pt-28 md:px-6 md:pt-32">
      {/* Glow de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 70% 0%, rgba(245,185,66,0.12), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* ─── Panel izquierdo: beneficios ─────────────── */}
        <section className="relative hidden overflow-hidden rounded-3xl border border-border bg-card p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 20% 100%, rgba(245,185,66,0.08), transparent 70%)",
            }}
          />
          <div className="relative">
            <p className="w-fit rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Cuenta {BRAND.name}
            </p>
            <h1 className="mt-6 font-heading text-4xl uppercase leading-[1.05] tracking-tight xl:text-5xl">
              Tu tienda,
              <br />
              <span className="text-accent">a tu medida</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Crea tu cuenta gratis y convierte cada pedido en una experiencia
              de dos clicks.
            </p>

            <ul className="mt-10 space-y-6">
              {benefits.map((benefit) => (
                <li key={benefit.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                    <benefit.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">{benefit.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["/products/vape-1.svg", "/products/vape-2.svg", "/products/vape-3.svg"].map(
                (src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    aria-hidden
                    className="h-12 w-12 rounded-full border-2 border-card object-cover"
                  />
                )
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              +40 sabores de las marcas top, con stock real.
            </p>
          </div>
        </section>

        {/* ─── Panel derecho: sign in ──────────────────── */}
        <section className="flex items-center">
          <div className="glow-gold w-full rounded-3xl border border-border bg-card p-8 sm:p-10">
            <p className="font-heading text-2xl uppercase tracking-wide">
              {BRAND.name}
              <span className="text-accent">.</span>
            </p>
            <h2 className="mt-6 text-2xl font-bold tracking-tight">
              Bienvenido de vuelta
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entra con tu cuenta de Google — sin contraseñas que recordar.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                No pudimos iniciar tu sesión. Intenta de nuevo o usa otra
                cuenta de Google.
              </div>
            )}

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo });
              }}
              className="mt-8"
            >
              <button
                type="submit"
                id="google-signin-button"
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continuar con Google
              </button>
            </form>

            <div className="my-8 flex items-center gap-4" aria-hidden>
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                o
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Link
              href="/productos"
              className="group flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-4 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              Seguir explorando sin cuenta
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Solo usamos tu nombre y correo para gestionar tus pedidos.
                Nunca publicamos nada ni compartimos tus datos.
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Sitio exclusivo para mayores de 18 años. Al continuar aceptas
              nuestros términos y condiciones.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
