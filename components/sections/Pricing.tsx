"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TIERS = [
  {
    name: "Esencial",
    price: "$499",
    description: "Ideal para eventos íntimos y reuniones familiares.",
    features: [
      "Hasta 50 invitados",
      "Confirmación de asistencia",
      "Mapa interactivo",
      "Galería básica (50 fotos)",
      "Soporte por email",
    ],
  },
  {
    name: "Premium",
    price: "$999",
    description: "La experiencia completa para bodas y XV años.",
    featured: true,
    features: [
      "Invitados ilimitados",
      "Confirmación de asistencia avanzada",
      "Música personalizada",
      "Galería ilimitada",
      "Mesa de regalos",
      "Soporte prioritario",
    ],
  },
  {
    name: "Pro",
    price: "$1,999",
    description: "Para organizadores y eventos de gran escala.",
    features: [
      "Todo lo de Premium",
      "Dominio personalizado (.com)",
      "Análisis en tiempo real",
      "Código QR impreso",
      "Diseño a medida",
      "Soporte 24/7",
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
            Un solo pago por evento. Sin suscripciones mensuales.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {TIERS.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card 
                className={`relative flex h-full flex-col justify-between p-8 ${
                  tier.featured 
                    ? "border-none glow-champagne z-10 transform md:scale-105" 
                    : "border-border bg-surface"
                }`}
              >
                {tier.featured && (
                  <div className="absolute inset-0 z-0 rounded-[inherit] border-glow pointer-events-none" />
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
                  <Button
                    className={`w-full ${
                      tier.featured 
                        ? "shimmer text-[var(--color-midnight)] border-none" 
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    size="lg"
                  >
                    Empezar con {tier.name}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
