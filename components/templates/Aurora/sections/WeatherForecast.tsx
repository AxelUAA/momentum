"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Sun, Cloud, CloudRain, Wind } from "lucide-react";

export function WeatherForecast({ location }: { location: { lat: number | null, lng: number | null } }) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí iría la llamada real a OpenWeatherMap
    // const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=TU_API_KEY&units=metric`)
    
    // Por ahora simulamos la carga de la API
    const timer = setTimeout(() => {
      setWeather({
        temp: 24,
        description: "Parcialmente nublado",
        pop: 10, // Probabilidad de lluvia
        icon: "cloud-sun"
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.lat, location.lng]);

  return (
    <section className="w-full bg-[#0F1B2D] py-20 px-4 border-t border-[var(--color-champagne)]/10">
      <div className="mx-auto max-w-4xl text-center">
        <motion.h2 
          className="font-heading text-3xl md:text-5xl text-[var(--color-champagne)] mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Pronóstico del Clima
        </motion.h2>

        <motion.div 
          className="mx-auto max-w-sm rounded-3xl bg-[#1B3A5C]/50 border border-[var(--color-champagne)]/20 p-8 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32 animate-pulse gap-4">
              <div className="h-12 w-12 rounded-full bg-white/10" />
              <div className="h-4 w-24 bg-white/10 rounded" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Cloud className="w-16 h-16 text-[var(--color-champagne)] mb-2" />
              <div className="text-5xl font-heading text-[#F4E3C5] mb-2">
                {weather.temp}°<span className="text-2xl">C</span>
              </div>
              <p className="font-sans text-lg text-[#F4E3C5]/90 capitalize">
                {weather.description}
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-[var(--color-champagne)] bg-[var(--color-champagne)]/10 px-4 py-1.5 rounded-full">
                <CloudRain size={16} />
                <span>{weather.pop}% probabilidad de lluvia</span>
              </div>
            </div>
          )}
        </motion.div>
        
        <p className="text-xs text-[#F4E3C5]/40 mt-6 tracking-widest uppercase">
          *Pronóstico estimado en la ubicación del evento
        </p>
      </div>
    </section>
  );
}
