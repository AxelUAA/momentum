"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

/* ─── Pago único (por evento) ──────────────────────────────────────── */

const ONE_TIME_TIERS = [
  {
    name: "Invitación Pro",
    price: "$499",
    tier: "ESSENTIAL",
    description: "Ideal para eventos íntimos y reuniones familiares.",
    features: [
      "Template Aurora incluido",
      "RSVP digital con confirmación",
      "Galería de fotos",
      "Mapa interactivo de ubicación",
      "Cuenta regresiva",
      "60 días activa después del evento",
    ],
  },
  {
    name: "Invitación Premium",
    price: "$999",
    tier: "LUXURY",
    description: "La experiencia completa para bodas y XV años.",
    featured: true,
    features: [
      "Template Aurora incluido",
      "RSVP digital con confirmación",
      "Galería de fotos",
      "Mapa interactivo de ubicación",
      "Código de vestimenta",
      "Mesa de regalos",
      "Cuenta regresiva",
      "Generador de mensajes WhatsApp",
      "Historial de invitados",
      "60 días activa después del evento",
    ],
  },
];

/* ─── Suscripciones (organizadores y agencias) ────────────────────── */

const SUBSCRIPTION_TIERS = [
  {
    name: "Organizador Plus",
    price: "$999",
    period: "/ mes",
    description: "Para wedding planners y equipos pequeños.",
    features: [
      "Hasta 5 eventos activos simultáneos",
      "Todas las funciones Premium incluidas",
      "Portal Stripe para gestionar tu plan",
      "Soporte prioritario",
    ],
  },
  {
    name: "Organizador Pro",
    price: "$1,999",
    period: "/ mes",
    description: "Para agencias con operación intensiva.",
    featured: true,
    features: [
      "Hasta 20 eventos activos simultáneos",
      "Todas las funciones Premium incluidas",
      "Portal Stripe para gestionar tu plan",
      "Soporte prioritario",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="w-full bg-background py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-4xl sm:text-5xl text-foreground">
            Precios transparentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Elige el plan que se adapte a tu evento.
          </p>
        </div>

        {/* ─── Pago único ─────────────────────────────────────── */}
        <div className="mx-auto mb-20 max-w-5xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h3 className="font-heading text-2xl text-foreground">
              Pago único por evento
            </h3>
            <span className="text-sm text-muted-foreground">
              Tu invitación queda activa hasta 60 días después del evento.
            </span>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {ONE_TIME_TIERS.map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card
                  className={cn(
                    "relative flex h-full flex-col justify-between p-8",
                    tier.featured
                      ? "border-none glow-champagne z-10 transform md:scale-[1.02]"
                      : "border-border bg-surface",
                  )}
                >
                  {tier.featured && (
                    <div className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] border-glow" />
                  )}

                  <div className="relative z-10">
                    {tier.featured && (
                      <Badge className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--color-champagne)] text-[var(--color-midnight)] hover:bg-[var(--color-champagne)]">
                        Más popular
                      </Badge>
                    )}
                    <h3 className="font-heading text-2xl text-foreground">{tier.name}</h3>
                    <div className="mt-4 flex items-baseline text-5xl font-bold text-foreground">
                      {tier.price}
                      <span className="ml-1 text-xl font-medium text-muted-foreground">
                        MXN
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                    <ul className="mt-8 space-y-4">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-[var(--color-success)] shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative z-10 mt-8">
                    <Link
                      href={`/buy?tier=${tier.tier}`}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "w-full",
                        tier.featured
                          ? "shimmer text-[var(--color-midnight)] border-none"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      )}
                    >
                      Comprar {tier.name}
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Suscripciones ──────────────────────────────────── */}
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
            <h3 className="font-heading text-2xl text-foreground">
              Para organizadores y agencias
            </h3>
            <span className="text-sm text-muted-foreground">
              Cancela cuando quieras desde el portal Stripe.
            </span>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {SUBSCRIPTION_TIERS.map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card
                  className={cn(
                    "relative flex h-full flex-col justify-between p-8",
                    tier.featured
                      ? "border-[var(--color-midnight)] bg-[var(--color-midnight)] text-[var(--color-cream)]"
                      : "border-border bg-surface",
                  )}
                >
                  <div className="relative z-10">
                    <h3
                      className={cn(
                        "font-heading text-2xl",
                        tier.featured ? "text-[var(--color-cream)]" : "text-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <div
                      className={cn(
                        "mt-4 flex items-baseline text-5xl font-bold",
                        tier.featured ? "text-[var(--color-cream)]" : "text-foreground",
                      )}
                    >
                      {tier.price}
                      <span
                        className={cn(
                          "ml-1 text-xl font-medium",
                          tier.featured
                            ? "text-[var(--color-cream)]/70"
                            : "text-muted-foreground",
                        )}
                      >
                        MXN {tier.period}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-4 text-sm",
                        tier.featured
                          ? "text-[var(--color-cream)]/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.description}
                    </p>
                    <ul className="mt-8 space-y-4">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check
                            className={cn(
                              "h-5 w-5 shrink-0",
                              tier.featured
                                ? "text-[var(--color-champagne)]"
                                : "text-[var(--color-success)]",
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm",
                              tier.featured ? "text-[var(--color-cream)]" : "text-foreground",
                            )}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative z-10 mt-8">
                    <Link
                      href={`/suscripcion?plan=${tier.name.includes("Plus") ? "plus" : "pro"}`}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "w-full",
                        tier.featured
                          ? "bg-[var(--color-champagne)] text-[var(--color-midnight)] hover:bg-[var(--color-champagne)]/90"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      )}
                    >
                      Suscribirme a {tier.name.replace("Organizador ", "")}
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
