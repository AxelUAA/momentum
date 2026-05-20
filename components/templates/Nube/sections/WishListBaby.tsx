"use client";

import { motion } from "motion/react";
import { Gift, ExternalLink, Star } from "lucide-react";
import type { WishListItem } from "@/types/event-settings";

export function WishListBaby({
  wishList,
  primaryColor,
}: {
  wishList: WishListItem[];
  primaryColor: string;
}) {
  if (!wishList || wishList.length === 0) return null;

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
          <h2 className="font-sans text-4xl md:text-5xl font-bold text-[#2c3e50] mb-6">
            Mesa de Regalos
          </h2>
          <p className="text-[#7f8c8d] max-w-lg mx-auto text-lg leading-relaxed font-medium">
            Tu presencia es nuestro mejor regalo. Si deseas tener un detalle, aquí te dejamos algunas ideas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishList.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#F9FBFC] rounded-[2rem] p-8 border border-[#ecf0f1] shadow-sm relative overflow-hidden group"
            >
              {/* Highlight for high priority */}
              {item.priority === "alta" && (
                <div 
                  className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  <Star className="w-3 h-3 fill-current" /> Alta Prioridad
                </div>
              )}
              
              <h3 className="font-sans font-bold text-[#34495e] text-xl mt-4 mb-4">
                {item.name}
              </h3>

              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold mt-2"
                  style={{ color: primaryColor }}
                >
                  Ver en tienda <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <span className="inline-block px-4 py-2 bg-white rounded-full text-xs font-bold text-[#95a5a6] mt-2 border border-[#ecf0f1]">
                  Tienda libre
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
