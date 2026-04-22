"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Compass } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Dynamic import for react-leaflet to prevent SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#1B3A5C] animate-pulse" /> }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

import type { EventLocationDetails } from "@/types/event-settings";

export function EventDetails({ 
  ceremony, 
  reception, 
  location 
}: { 
  ceremony: EventLocationDetails; 
  reception: EventLocationDetails; 
  location: { lat: number | null, lng: number | null, name: string | null, address: string | null } 
}) {
  const { lat, lng, name, address } = location;
  const mapPosition: [number, number] = [lat || 19.4326, lng || -99.1332];

  // Icono para Leaflet (evitar error de icono faltante por defecto)
  const markerIcon = typeof window !== "undefined" ? new (require("leaflet").Icon)({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }) : null;

  return (
    <section className="w-full bg-[#0F1B2D] py-24 md:py-32 px-4 border-t border-[var(--color-champagne)]/10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="font-heading text-4xl md:text-6xl text-[var(--color-champagne)] mb-4">
            Dónde & Cuándo
          </h2>
          <p className="text-[#F4E3C5]/70 font-sans tracking-widest uppercase text-sm">
            Los detalles de nuestra celebración
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Detalles (Ceremonia / Recepción) */}
          <div className="flex flex-col justify-center gap-12">
            <motion.div
              className="flex flex-col gap-4 border-l-2 border-[var(--color-champagne)] pl-6 py-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-[#F4E3C5]/70">Ceremonia Religiosa</h3>
              <div className="font-serif text-5xl text-[var(--color-champagne)]">{ceremony.time} <span className="text-2xl">HRS</span></div>
              <p className="font-heading text-2xl text-[#F4E3C5] mt-2">{ceremony.name}</p>
              <p className="text-[#F4E3C5]/60 text-sm">{ceremony.address}</p>
            </motion.div>

            <motion.div
              className="flex flex-col gap-4 border-l-2 border-[var(--color-champagne)] pl-6 py-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-[#F4E3C5]/70">Recepción</h3>
              <div className="font-serif text-5xl text-[var(--color-champagne)]">{reception.time} <span className="text-2xl">HRS</span></div>
              <p className="font-heading text-2xl text-[#F4E3C5] mt-2">{reception.name}</p>
              <p className="text-[#F4E3C5]/60 text-sm">{reception.address}</p>
            </motion.div>
          </div>

          {/* Mapa y Botones */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-[var(--color-champagne)]/20 relative z-0">
              {typeof window !== "undefined" && (
                <MapContainer center={mapPosition} zoom={15} scrollWheelZoom={false} className="w-full h-full">
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                  />
                  {markerIcon && <Marker position={mapPosition} icon={markerIcon} />}
                </MapContainer>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${mapPosition[0]},${mapPosition[1]}`} 
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition"
              >
                <MapPin size={16} className="text-[var(--color-champagne)]" /> Google Maps
              </a>
              <a 
                href={`https://waze.com/ul?ll=${mapPosition[0]},${mapPosition[1]}&navigate=yes`} 
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition"
              >
                <Navigation size={16} className="text-[var(--color-champagne)]" /> Waze
              </a>
              <a 
                href={`http://maps.apple.com/?q=${mapPosition[0]},${mapPosition[1]}`} 
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition"
              >
                <Compass size={16} className="text-[var(--color-champagne)]" /> Apple Maps
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
