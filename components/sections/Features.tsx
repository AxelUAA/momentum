"use client";

import { motion } from "motion/react";
import {
  Users,
  MapPin,
  Clock,
  Image as ImageIcon,
  Hash,
  Gift,
  Music,
  Bell,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Bell,
    title: "RSVP en tiempo real",
    description: "Recibe notificaciones instantáneas y gestiona confirmaciones sin estrés. Sincronización automática de asistentes.",
    span: "col-span-1 md:col-span-2 lg:col-span-2 row-span-2",
    featured: true,
  },
  {
    icon: Users,
    title: "Invitados ilimitados",
    description: "Sube tu lista desde Excel.",
    span: "col-span-1",
  },
  {
    icon: MapPin,
    title: "Ubicación GPS",
    description: "Mapas interactivos con Waze/Maps.",
    span: "col-span-1",
  },
  {
    icon: Clock,
    title: "Cuenta regresiva",
    description: "Sube la expectativa.",
    span: "col-span-1",
  },
  {
    icon: ImageIcon,
    title: "Galería",
    description: "Tus mejores momentos.",
    span: "col-span-1",
  },
  {
    icon: Hash,
    title: "Hashtag",
    description: "Recolecta fotos sociales.",
    span: "col-span-1",
  },
  {
    icon: Gift,
    title: "Mesa de regalos",
    description: "Links directos a tiendas.",
    span: "col-span-1",
  },
  {
    icon: Music,
    title: "Música",
    description: "Tu canción favorita de fondo.",
    span: "col-span-1 lg:col-span-2",
  },
];

export function Features() {
  return (
    <section className="w-full bg-[var(--color-cream)] dark:bg-[var(--color-midnight)] py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-4xl sm:text-5xl text-foreground">
            Todo lo que necesitas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Funciones diseñadas para que tu evento sea perfecto de principio a fin.
          </p>
        </div>

        <div className="grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              className={feature.span}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="group h-full w-full overflow-hidden border-border bg-surface transition-colors hover:bg-muted/50 p-6 flex flex-col justify-between">
                <div>
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background shadow-sm ${feature.featured ? 'text-[var(--color-champagne)]' : 'text-[var(--color-midnight)] dark:text-[var(--color-cream)]'}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className={`font-heading ${feature.featured ? 'text-3xl' : 'text-xl'} text-foreground mb-2`}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {feature.featured && (
                  <div className="mt-6 flex-1 rounded-xl bg-gradient-to-br from-[var(--color-midnight)] to-zinc-900 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[var(--color-champagne)] opacity-10 mix-blend-overlay" />
                    {/* Abstract illustration of a dashboard/notification */}
                    <div className="absolute -bottom-6 -right-6 h-32 w-48 rounded-lg bg-surface/10 p-4 shadow-2xl backdrop-blur-md transform rotate-[-5deg]">
                      <div className="h-4 w-2/3 rounded bg-white/20 mb-3" />
                      <div className="h-4 w-full rounded bg-white/10 mb-2" />
                      <div className="h-4 w-4/5 rounded bg-white/10" />
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
