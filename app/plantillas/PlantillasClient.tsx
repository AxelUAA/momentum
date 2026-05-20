"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, ShoppingBag, Star, Sparkles } from "lucide-react";

/* ─── Tipos ──────────────────────────────────────────────────────────── */

type Template = {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  previewImageUrl: string | null;
  isPremium: boolean;
};

/* ─── Constantes ─────────────────────────────────────────────────────── */

const TYPE_LABELS: Record<string, string> = {
  WEDDING:     "Boda",
  XV:          "XV Años",
  BIRTHDAY:    "Cumpleaños",
  BABY_SHOWER: "Baby Shower",
  BAPTISM:     "Bautizo",
  GRADUATION:  "Graduación",
  CORPORATE:   "Corporativo",
};

const TYPE_EMOJIS: Record<string, string> = {
  WEDDING:     "💍",
  XV:          "👑",
  BIRTHDAY:    "🎂",
  BABY_SHOWER: "🍼",
  BAPTISM:     "✝️",
  GRADUATION:  "🎓",
  CORPORATE:   "💼",
};

// URL de demo por slug de plantilla
const DEMO_URLS: Record<string, string> = {
  aurora:    "/demo",
  bloom:     "/demo/quince",
  confetti:  "/demo/birthday",
  nube:      "/demo/baby-shower",
};

// Imagen de preview por slug (fallback mientras no haya screenshot real)
const FALLBACK_IMAGES: Record<string, string> = {
  aurora:   "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  bloom:    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
  confetti: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
  nube:     "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
};

/* ─── Componente ─────────────────────────────────────────────────────── */

export default function PlantillasClient({ templates }: { templates: Template[] }) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  // Construir filtros dinámicamente según los tipos disponibles
  const availableTypes = Array.from(new Set(templates.map((t) => t.type)));
  const filters = [
    { value: "ALL", label: "Todas" },
    ...availableTypes.map((type) => ({
      value: type,
      label: `${TYPE_EMOJIS[type] ?? ""} ${TYPE_LABELS[type] ?? type}`,
    })),
  ];

  const visible =
    activeFilter === "ALL"
      ? templates
      : templates.filter((t) => t.type === activeFilter);

  return (
    <main className="min-h-screen bg-[var(--color-cream)]">
      {/* ── Header ── */}
      <div className="border-b border-black/8 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-midnight)]/60 hover:text-[var(--color-midnight)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Inicio
          </Link>
          <span className="text-[var(--color-midnight)]/20">·</span>
          <span
            className="text-lg font-bold text-[var(--color-midnight)]"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Momentum
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* ── Hero ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-champagne)]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-champagne)] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Invitaciones digitales
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold text-[var(--color-midnight)] tracking-tight mb-4"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Elige tu plantilla
          </h1>
          <p className="text-[var(--color-midnight)]/60 max-w-xl mx-auto text-lg">
            Cada plantilla está diseñada para un tipo de evento. Explora el demo,
            elige la que te enamore y compra en segundos.
          </p>
        </div>

        {/* ── Filtros ── */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                activeFilter === f.value
                  ? "bg-[var(--color-midnight)] text-[var(--color-cream)] shadow-lg"
                  : "bg-white border border-black/10 text-[var(--color-midnight)] hover:border-[var(--color-champagne)]/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Grid de plantillas ── */}
        {visible.length === 0 ? (
          <div className="text-center py-24 text-[var(--color-midnight)]/40">
            No hay plantillas disponibles para este filtro aún.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((template) => {
              const demoUrl = DEMO_URLS[template.slug] ?? null;
              const imgSrc =
                template.previewImageUrl ?? FALLBACK_IMAGES[template.slug] ?? null;
              const price = template.isPremium ? "$999" : "$499";
              const typeLabel = TYPE_LABELS[template.type] ?? template.type;
              const typeEmoji = TYPE_EMOJIS[template.type] ?? "🎉";

              return (
                <div
                  key={template.id}
                  className="group rounded-3xl border border-black/8 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  {/* Preview image */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-champagne)]/20 overflow-hidden">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={`Preview de ${template.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {typeEmoji}
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-[var(--color-midnight)]">
                        {typeEmoji} {typeLabel}
                      </span>
                    </div>
                    {template.isPremium && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-midnight)]/80 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-[var(--color-champagne)]">
                          <Star className="h-3 w-3" />
                          Premium
                        </span>
                      </div>
                    )}

                    {/* Demo overlay */}
                    {demoUrl && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Link
                          href={demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[var(--color-midnight)] shadow-lg hover:scale-105 transition-transform"
                        >
                          <Eye className="h-4 w-4" />
                          Ver demo
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3
                        className="text-xl font-bold text-[var(--color-midnight)]"
                        style={{ fontFamily: "var(--font-fraunces, serif)" }}
                      >
                        {template.name}
                      </h3>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-bold text-[var(--color-midnight)]">
                          {price}
                        </div>
                        <div className="text-xs text-[var(--color-midnight)]/40">MXN</div>
                      </div>
                    </div>

                    {template.description && (
                      <p className="text-sm text-[var(--color-midnight)]/60 mb-5 flex-1">
                        {template.description}
                      </p>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2 mt-auto pt-4 border-t border-black/5">
                      {demoUrl && (
                        <Link
                          href={demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/10 px-4 py-2.5 text-xs font-semibold text-[var(--color-midnight)] hover:border-[var(--color-champagne)]/60 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver demo
                        </Link>
                      )}
                      <Link
                        href={`/buy?template=${template.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-midnight)] px-4 py-2.5 text-xs font-bold text-[var(--color-cream)] hover:opacity-90 transition-all"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Comprar esta
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Footer CTA ── */}
        <div className="mt-16 text-center rounded-3xl bg-[var(--color-midnight)] p-12">
          <p
            className="text-2xl font-bold text-[var(--color-cream)] mb-3"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            ¿Tienes dudas?
          </p>
          <p className="text-[var(--color-cream)]/60 mb-6 text-sm">
            Escríbenos y con gusto te ayudamos a elegir la plantilla ideal.
          </p>
          <a
            href="mailto:axelinm11@gmail.com"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-champagne)] px-6 py-3 text-sm font-bold text-[var(--color-midnight)] hover:opacity-90 transition-all"
          >
            Contactar al equipo
          </a>
        </div>
      </div>
    </main>
  );
}
