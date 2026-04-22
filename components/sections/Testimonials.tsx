"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const TESTIMONIALS = [
  {
    name: "Sofía Ramírez",
    event: "Boda · CDMX",
    initials: "SR",
    quote:
      "Mis invitados no podían creer lo bonitas que quedaron. Tuvimos 100% de confirmaciones en 48 horas. Vale cada peso.",
  },
  {
    name: "Valentina Torres",
    event: "XV Años · Guadalajara",
    initials: "VT",
    quote:
      "Lo usé para mis XV y todos preguntaron cómo las hice. La función de RSVP me ahorró horas de llamadas.",
  },
  {
    name: "Carlos & Mariana Peña",
    event: "Boda · Monterrey",
    initials: "CM",
    quote:
      "Encontramos Momentum a 3 semanas de la boda. En una tarde teníamos todo listo. El soporte fue increíble.",
  },
  {
    name: "Lucía Mendoza",
    event: "Baby Shower · Puebla",
    initials: "LM",
    quote:
      "Diseño hermoso, súper fácil de usar. Mis invitadas me dijeron que la invitación era más bonita que las de boda.",
  },
  {
    name: "Andrés García",
    event: "Evento Corporativo · CDMX",
    initials: "AG",
    quote:
      "Lo probé para un evento de empresa y quedé sorprendido. Profesional, rápido y con seguimiento en tiempo real.",
  },
  {
    name: "Isabela Fuentes",
    event: "Bautizo · León",
    initials: "IF",
    quote:
      "Nunca pensé que una invitación digital pudiera verse así de bien. La familia mayor también pudo abrirla sin problema.",
  },
];

export function Testimonials() {
  return (
    <section className="w-full bg-[var(--color-cream)] dark:bg-[var(--color-midnight)] py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-4xl sm:text-5xl text-foreground">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Parejas, familias y organizadores de toda la República confían en Momentum.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
            >
              <Card className="flex h-full flex-col gap-4 border-border bg-surface p-6">
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-[var(--color-champagne)] text-[var(--color-champagne)]"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="flex-1 text-sm leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-champagne)]/20 text-sm font-semibold text-[var(--color-champagne)]">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.event}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
