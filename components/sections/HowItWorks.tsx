"use client";

import { motion } from "motion/react";
import { Sparkles, Wand2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    icon: Sparkles,
    title: "Elige tu plantilla",
    description: "Diseños curados por expertos para bodas, XV años y corporativos.",
  },
  {
    icon: Wand2,
    title: "Personaliza en minutos",
    description: "Modifica colores, fuentes y detalles para que coincidan con tu evento.",
  },
  {
    icon: Send,
    title: "Comparte y gestiona RSVPs",
    description: "Envía por WhatsApp y observa las confirmaciones en tiempo real.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full bg-[var(--color-cream)] dark:bg-[var(--color-midnight)] py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-4xl sm:text-5xl text-foreground">
            Tres pasos para la perfección
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Diseñamos un flujo intuitivo para que tengas tu invitación lista en minutos.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="group relative overflow-hidden border-none bg-surface transition-all hover:-translate-y-2 h-full">
                {/* Hover border glow effect defined in globals.css */}
                <div className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 border-glow" />
                
                <CardContent className="relative z-10 flex flex-col items-center p-8 text-center bg-surface h-full m-[1px] rounded-[inherit]">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-champagne)]/20 text-[var(--color-champagne)]">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 font-heading text-2xl text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
