"use client";

import { motion } from "motion/react";
import { Sparkles, Zap, Heart } from "lucide-react";

const VALUE_PROPS = [
  {
    icon: Sparkles,
    title: "Diseño de revista",
    description:
      "Plantillas hechas por diseñadores premium, no templates genéricos.",
  },
  {
    icon: Zap,
    title: "Listo en 5 minutos",
    description:
      "Personaliza tu invitación y envíala el mismo día sin diseñador.",
  },
  {
    icon: Heart,
    title: "Hecho en México",
    description:
      "Pagos en pesos, OXXO Pay, soporte en español y diseños para nuestra cultura.",
  },
];

export function ValueProps() {
  return (
    <section className="w-full border-y border-border bg-surface/50 py-16">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {VALUE_PROPS.map((prop, index) => (
            <motion.div
              key={prop.title}
              className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
            >
              <prop.icon className="h-7 w-7 text-[var(--color-champagne)]" />
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {prop.title}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {prop.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
