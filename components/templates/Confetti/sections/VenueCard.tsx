"use client";

import { motion } from "motion/react";
import type { EventLocationDetails } from "@/types/event-settings";

export function VenueCard({
  venue,
  primaryColor,
}: {
  venue: EventLocationDetails;
  primaryColor: string;
}) {
  return (
    <section className="w-full bg-white py-24 px-4">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-black text-4xl md:text-6xl text-[#1A1A1A]">El Lugar</h2>
        </motion.div>

        <motion.div
          className="rounded-3xl p-8 md:p-12 shadow-xl border-2 text-center bg-[#FFFBF5]"
          style={{ borderColor: primaryColor }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl"
            style={{ backgroundColor: `${primaryColor}18` }}
          >
            🎊
          </div>

          <h3 className="font-black text-2xl md:text-3xl text-[#1A1A1A] mb-2">
            {venue.name}
          </h3>

          <p className="text-[#666] text-lg leading-snug">{venue.address}</p>

          {venue.time && (
            <p className="font-bold text-xl mt-4 mb-8" style={{ color: primaryColor }}>
              ⏰ {venue.time}
            </p>
          )}

          {!venue.time && <div className="mb-8" />}

          {venue.mapsUrl && (
            <motion.a
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-lg shadow-lg"
              style={{ backgroundColor: primaryColor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Cómo llegar
            </motion.a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
