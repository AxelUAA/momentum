"use client";

import { motion } from "motion/react";
import type { WishListItem } from "@/types/event-settings";

const PRIORITY_BADGE: Record<
  WishListItem["priority"],
  { label: string; bg: string; color: string }
> = {
  alta: { label: "Top wish ⭐", bg: "#FF6B6B", color: "#fff" },
  media: { label: "Lo desea", bg: "#FFD166", color: "#1A1A1A" },
  baja: { label: "Bonus", bg: "#E8E8E8", color: "#666" },
};

export function WishListSection({
  wishList,
  primaryColor,
}: {
  wishList: WishListItem[];
  primaryColor: string;
}) {
  if (!wishList?.length) return null;

  return (
    <section className="w-full bg-[#FFFBF5] py-24 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-black text-4xl md:text-6xl text-[#1A1A1A]">
            Lista de{" "}
            <span style={{ color: primaryColor }}>Deseos</span>
          </h2>
          <p className="text-[#666] mt-3 text-lg font-medium">
            ¿Quieres hacerle un regalo especial?
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {wishList.map((item, i) => {
            const badge = PRIORITY_BADGE[item.priority] ?? PRIORITY_BADGE.baja;
            return (
              <motion.div
                key={i}
                className="flex items-center justify-between gap-4 bg-white rounded-2xl p-5 shadow-md border border-black/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A1A1A] text-base leading-snug">
                    {item.name}
                  </p>
                  <span
                    className="inline-block mt-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: badge.bg, color: badge.color }}
                  >
                    {badge.label}
                  </span>
                </div>

                {item.url && (
                  <motion.a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm text-white shadow whitespace-nowrap"
                    style={{ backgroundColor: primaryColor }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Ver en tienda
                  </motion.a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
