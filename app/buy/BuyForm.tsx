"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2, Lock, ArrowLeft, Eye, Star, Check, User,
  Heart, Crown, Cake, Baby, Droplets, GraduationCap, Building2,
  type LucideIcon,
} from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  WEDDING:     "Boda",
  XV:          "XV Años",
  BIRTHDAY:    "Cumpleaños",
  BABY_SHOWER: "Baby Shower",
  BAPTISM:     "Bautizo",
  GRADUATION:  "Graduación",
  CORPORATE:   "Corporativo",
};

const TYPE_ICON: Record<string, LucideIcon> = {
  WEDDING:     Heart,
  XV:          Crown,
  BIRTHDAY:    Cake,
  BABY_SHOWER: Baby,
  BAPTISM:     Droplets,
  GRADUATION:  GraduationCap,
  CORPORATE:   Building2,
};

const DEMO_URLS: Record<string, string> = {
  aurora:   "/demo",
  bloom:    "/demo/quince",
  confetti: "/demo/birthday",
  nube:     "/demo/baby-shower",
};

const FALLBACK_IMAGES: Record<string, string> = {
  aurora:   "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  bloom:    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
  confetti: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
  nube:     "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
};

type TemplateData = {
  slug: string;
  name: string;
  type: string;
  description: string | null;
  previewImageUrl: string | null;
  isPremium: boolean;
};

type Props = {
  template: TemplateData;
  userName: string;
  userEmail: string;
};

export default function BuyForm({ template, userName, userEmail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = template.isPremium ? "$999" : "$499";
  const demoUrl = DEMO_URLS[template.slug] ?? null;
  const imgSrc = template.previewImageUrl ?? FALLBACK_IMAGES[template.slug] ?? null;
  const typeLabel = TYPE_LABELS[template.type] ?? template.type;
  const TypeIcon = TYPE_ICON[template.type] ?? Star;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug: template.slug }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Error al iniciar el pago. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      router.push(data.url);
    } catch {
      setError("Error de red. Verifica tu conexión e intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-cream)] py-12 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <Link
          href="/plantillas"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-midnight)]/60 hover:text-[var(--color-midnight)] mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver todas las plantillas
        </Link>

        <h1
          className="text-3xl sm:text-4xl font-bold text-[var(--color-midnight)] tracking-tight mb-2"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          Comprar plantilla {template.name}
        </h1>
        <p className="text-[var(--color-midnight)]/60 mb-10">
          Tu invitación aparecerá en tu dashboard en minutos después del pago.
        </p>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* ── Preview de la plantilla ── */}
          <div className="space-y-5">
            {/* Imagen */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-champagne)]/20">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={`Preview ${template.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <TypeIcon className="h-16 w-16 text-[var(--color-champagne)]/40" />
                </div>
              )}
              {template.isPremium && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-midnight)]/80 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-[var(--color-champagne)]">
                    <Star className="h-3 w-3" />
                    Premium
                  </span>
                </div>
              )}
            </div>

            {/* Info de la plantilla */}
            <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-bold text-[var(--color-midnight)]"
                    style={{ fontFamily: "var(--font-fraunces, serif)" }}
                  >
                    {template.name}
                  </h2>
                  <span className="text-sm text-[var(--color-midnight)]/50">{typeLabel}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--color-midnight)]">{price}</div>
                  <div className="text-xs text-[var(--color-midnight)]/40">MXN · pago único</div>
                </div>
              </div>

              {template.description && (
                <p className="text-sm text-[var(--color-midnight)]/60">{template.description}</p>
              )}

              <ul className="space-y-2 pt-2 border-t border-black/5">
                {(template.isPremium
                    ? [
                        "RSVP digital con confirmación",
                        "Galería de fotos",
                        "Mapa interactivo",
                        "Cuenta regresiva",
                        "Código de vestimenta",
                        "Mesa de regalos",
                        "Música Spotify en tu invitación",
                        "Libro de visitas digital",
                        "Generador de mensajes WhatsApp",
                        "60 días activa tras el evento",
                      ]
                    : [
                        "RSVP digital con confirmación",
                        "Galería de fotos",
                        "Mapa interactivo",
                        "Cuenta regresiva",
                        "60 días activa tras el evento",
                      ]
                  ).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[var(--color-midnight)]/70">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              {demoUrl && (
                <Link
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-black/10 py-2.5 text-xs font-semibold text-[var(--color-midnight)] hover:border-[var(--color-champagne)]/60 transition-all w-full"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver demo en vivo
                </Link>
              )}
            </div>
          </div>

          {/* ── Formulario de compra ── */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-[var(--color-midnight)]/50 mb-4">
              Confirmación de compra
            </p>
            <div className="rounded-2xl border border-black/8 bg-white p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* User info (read-only) */}
                <div className="rounded-xl bg-[var(--color-cream)] p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-champagne)]/20 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-[var(--color-champagne)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-midnight)] truncate">{userName}</p>
                    <p className="text-xs text-[var(--color-midnight)]/50 truncate">{userEmail}</p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="shrink-0 text-xs text-[var(--color-midnight)]/40 hover:text-[var(--color-midnight)] underline transition-colors"
                  >
                    Cambiar
                  </Link>
                </div>

                {/* Resumen */}
                <div className="rounded-xl bg-[var(--color-cream)] p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-midnight)]/60">
                      {template.name} · {typeLabel}
                    </span>
                    <span className="font-semibold text-[var(--color-midnight)]">
                      {price} MXN
                    </span>
                  </div>
                  <div className="border-t border-black/8 pt-2 flex justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-midnight)]/50">
                      Total
                    </span>
                    <span className="text-lg font-bold text-[var(--color-midnight)]">
                      {price} MXN
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[var(--color-midnight)] py-4 text-sm font-bold uppercase tracking-widest text-[var(--color-cream)] hover:bg-[var(--color-midnight)]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirigiendo a Stripe...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pagar {price} MXN con Stripe
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-[var(--color-midnight)]/40">
                  Puedes pagar con tarjeta o OXXO. Pago seguro vía Stripe.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
