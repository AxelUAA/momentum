"use client";

import { motion } from "motion/react";
import { Gift, CreditCard, ShoppingBag } from "lucide-react";
import type { GiftRegistryConfig } from "@/types/event-settings";

export function GiftRegistryBloom({
  config,
  primaryColor,
}: {
  config?: GiftRegistryConfig;
  primaryColor: string;
}) {
  if (!config) return null;

  const hasEnvelope = config.digitalEnvelope?.enabled;
  const hasLiverpool = config.liverpool?.enabled;

  if (!hasEnvelope && !hasLiverpool) return null;

  return (
    <section className="w-full bg-white py-24 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div 
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2c2c2c] mb-6">
            Mesa de Regalos
          </h2>
          <p className="text-[#666] max-w-lg mx-auto text-lg leading-relaxed font-light">
            El mejor regalo es tu presencia, pero si deseas tener un detalle conmigo, te comparto estas opciones:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
          {/* Digital Envelope */}
          {hasEnvelope && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#FAFAFA] border border-[#f0f0f0] rounded-[2rem] p-10 flex flex-col items-center shadow-sm"
            >
              <CreditCard className="w-10 h-10 mb-6 text-[#444]" />
              <h3 className="font-serif text-2xl text-[#2c2c2c] mb-4">Lluvia de Sobres</h3>
              <p className="text-[#666] mb-8 font-light text-center">
                Agradezco infinitamente tu aportación, habrá un buzón el día del evento.
              </p>
              {config.digitalEnvelope?.suggestedAmount && (
                <div className="px-6 py-3 bg-white rounded-full text-[#444] font-medium border border-[#eaeaea]">
                  Sugerencia: ${config.digitalEnvelope.suggestedAmount}
                </div>
              )}
            </motion.div>
          )}

          {/* Liverpool */}
          {hasLiverpool && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#FAFAFA] border border-[#f0f0f0] rounded-[2rem] p-10 flex flex-col items-center shadow-sm"
            >
              <ShoppingBag className="w-10 h-10 mb-6 text-[#444]" />
              <h3 className="font-serif text-2xl text-[#2c2c2c] mb-4">Liverpool</h3>
              <p className="text-[#666] mb-8 font-light text-center">
                Puedes encontrar mi mesa de regalos en línea o en cualquier sucursal.
              </p>
              <div className="px-6 py-3 bg-white rounded-full text-[#444] font-medium border border-[#eaeaea] mb-6">
                Código: {config.liverpool?.eventCode}
              </div>
              <a
                href={`https://mesaderegalos.liverpool.com.mx/milistaderegalos/${config.liverpool?.eventCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium transition-transform hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                Ver mesa de regalos
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
