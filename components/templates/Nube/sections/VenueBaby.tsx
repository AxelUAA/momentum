"use client";

import { motion } from "motion/react";
import { MapPin, Clock, CalendarDays } from "lucide-react";
import type { EventLocationDetails } from "@/types/event-settings";
import type { Event } from "@prisma/client";

export function VenueBaby({
  venue,
  event,
  primaryColor,
}: {
  venue: EventLocationDetails;
  event: Event;
  primaryColor: string;
}) {
  if (!venue) return null;

  return (
    <section className="w-full bg-white py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#F9FBFC] rounded-[3rem] p-8 md:p-16 text-center shadow-sm border border-[#ecf0f1]"
        >
          <h2 className="font-sans text-4xl md:text-5xl font-bold text-[#2c3e50] mb-12">
            Te Esperamos
          </h2>

          <div className="flex flex-col gap-8 mb-12">
            {event.eventDate && (
              <div className="flex items-center justify-center gap-4 text-left">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[#95a5a6] font-bold text-sm uppercase tracking-wider">Fecha</p>
                  <p className="text-[#34495e] font-bold text-xl">
                    {new Date(event.eventDate).toLocaleDateString("es-MX", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 text-left">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[#95a5a6] font-bold text-sm uppercase tracking-wider">Hora</p>
                <p className="text-[#34495e] font-bold text-xl">{venue.time} hrs</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-left">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[#95a5a6] font-bold text-sm uppercase tracking-wider">Lugar</p>
                <p className="text-[#34495e] font-bold text-xl">{venue.name}</p>
                <p className="text-[#7f8c8d]">{venue.address}</p>
              </div>
            </div>
          </div>

          {venue.mapsUrl && (
            <a
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-10 py-4 rounded-full text-white font-bold transition-transform hover:scale-105 shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              <MapPin className="w-5 h-5" />
              Ver Mapa
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
