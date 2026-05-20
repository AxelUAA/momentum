"use client";

import { motion } from "motion/react";
import { Church, Sparkles, MapPin } from "lucide-react";
import type { EventLocationDetails } from "@/types/event-settings";

export function VenuesQuince({
  misa,
  fiesta,
  primaryColor,
}: {
  misa?: EventLocationDetails;
  fiesta?: EventLocationDetails;
  primaryColor: string;
}) {
  if (!misa && !fiesta) return null;

  return (
    <section className="w-full bg-white py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-[#2c2c2c] mb-4">
            Dónde & Cuándo
          </h2>
          <div className="w-24 h-px bg-[#e0e0e0] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Misa */}
          {misa && misa.name && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-8 rounded-[2rem] bg-[#FAFAFA] border border-[#f0f0f0]"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-sm"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <Church className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-3xl text-[#2c2c2c] mb-2">Ceremonia Religiosa</h3>
              <p className="text-2xl font-light text-[#555] mb-6">{misa.time} hrs</p>
              
              <div className="space-y-2 mb-8">
                <p className="font-bold text-[#333] text-lg">{misa.name}</p>
                <p className="text-[#666] leading-relaxed max-w-sm">{misa.address}</p>
              </div>

              {misa.mapsUrl && (
                <a
                  href={misa.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium transition-transform hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  <MapPin className="w-4 h-4" />
                  Ver en Google Maps
                </a>
              )}
            </motion.div>
          )}

          {/* Fiesta */}
          {fiesta && fiesta.name && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-8 rounded-[2rem] bg-[#FAFAFA] border border-[#f0f0f0]"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-sm"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-3xl text-[#2c2c2c] mb-2">Recepción</h3>
              <p className="text-2xl font-light text-[#555] mb-6">{fiesta.time} hrs</p>
              
              <div className="space-y-2 mb-8">
                <p className="font-bold text-[#333] text-lg">{fiesta.name}</p>
                <p className="text-[#666] leading-relaxed max-w-sm">{fiesta.address}</p>
              </div>

              {fiesta.mapsUrl && (
                <a
                  href={fiesta.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium transition-transform hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  <MapPin className="w-4 h-4" />
                  Ver en Google Maps
                </a>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
