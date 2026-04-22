"use client";

import { motion } from "motion/react";
import { Gift, CreditCard, ExternalLink } from "lucide-react";
import type { GiftRegistryConfig } from "@/types/event-settings";

export function GiftRegistry({ config }: { config: GiftRegistryConfig }) {
  return (
    <section className="w-full bg-[#1B3A5C] py-24 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Gift className="w-12 h-12 mx-auto text-[var(--color-champagne)] mb-6" />
          <h2 className="font-heading text-4xl md:text-5xl text-[#F4E3C5] mb-6">
            Mesa de Regalos
          </h2>
          <p className="text-[#F4E3C5]/70 font-sans max-w-xl mx-auto mb-12">
            El mejor regalo es tu presencia. Sin embargo, si deseas tener un detalle con nosotros, te dejamos algunas opciones.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Opción 1: Aportación */}
          {config?.digitalEnvelope?.enabled && (
            <motion.div 
              className="bg-[#0F1B2D] p-8 rounded-3xl border border-[var(--color-champagne)]/20 flex flex-col items-center justify-between"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <h3 className="font-heading text-2xl text-[var(--color-champagne)] mb-4">
                  Sobre Digital
                </h3>
                <p className="text-sm text-[#F4E3C5]/60 mb-8">
                  Aportación para nuestra luna de miel a través de tarjeta de crédito/débito.
                </p>
              </div>

              <div className="w-full max-w-xs">
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">$</span>
                  <input 
                    type="number" 
                    placeholder={config.digitalEnvelope.suggestedAmount?.toString() || "1000"}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-center focus:outline-none focus:border-[var(--color-champagne)]"
                  />
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-[var(--color-champagne)] text-[#0F1B2D] py-3 rounded-full font-medium hover:bg-[#F4E3C5] transition shadow-lg">
                  <CreditCard size={18} /> Aportar
                </button>
              </div>
            </motion.div>
          )}

          {/* Opción 2: Tienda */}
          {config?.liverpool?.enabled && (
            <motion.div 
              className="bg-[#0F1B2D] p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-between"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
               <div>
                <h3 className="font-heading text-2xl text-white mb-4">
                  Liverpool
                </h3>
                <p className="text-sm text-white/60 mb-8">
                  También contamos con una mesa de regalos física y online en tiendas Liverpool.
                </p>
              </div>

              <div className="w-full max-w-xs space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
                  <span className="block text-xs uppercase tracking-widest text-white/40 mb-1">Evento</span>
                  <span className="font-serif text-xl text-white">#{config.liverpool.eventCode}</span>
                </div>
                <a 
                  href="#"
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 bg-white/10 text-white py-3 rounded-full font-medium hover:bg-white/20 transition"
                >
                  Ver mesa <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
