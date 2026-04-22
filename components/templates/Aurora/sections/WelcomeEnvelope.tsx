"use client";

import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { Howl } from "howler";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function WelcomeEnvelope({
  event,
  guest,
  settings,
  onOpen,
}: {
  event: any;
  guest: any;
  settings: any;
  onOpen: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Inicializar Howler
    if (settings.musicUrl) {
      soundRef.current = new Howl({
        src: [settings.musicUrl],
        loop: true,
        volume: 0.5,
        html5: true, // Evita problemas de CORS o restricciones estrictas del browser
      });
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [settings.musicUrl]);

  const handleOpen = () => {
    setIsOpen(true);

    // Disparar confeti color champagne
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const colors = ["#D4AF7A", "#F4E3C5", "#C49A60", "#FFFFFF"];

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        colors,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);

    // Reproducir música si el usuario interactuó
    if (soundRef.current && !isPlaying) {
      soundRef.current.play();
      setIsPlaying(true);
    }

    // Esperar a que termine la animación para notificar al componente padre
    setTimeout(() => {
      onOpen();
    }, 2500);
  };

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar abrir el sobre si clickean el botón de música
    if (!soundRef.current) return;
    
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0F1B2D]">
      {/* Botón flotante de audio */}
      <button
        onClick={toggleMusic}
        className="absolute bottom-6 right-6 z-50 rounded-full bg-white/10 p-3 text-[var(--color-champagne)] backdrop-blur-md transition hover:bg-white/20"
        aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
      >
        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

      {/* Aurora Background Effects */}
      <div className="absolute -inset-[100%] z-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1B3A5C] to-transparent mix-blend-screen" />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-champagne)] opacity-20 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="z-10 flex flex-col items-center gap-8 text-center px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <h2 className="font-heading text-4xl md:text-5xl font-medium tracking-wide text-[var(--color-champagne)]">
            {event.title}
          </h2>
          <p className="mt-4 font-sans text-sm tracking-widest text-[#F4E3C5]/70 uppercase">
            Te invitamos a celebrar
          </p>
        </motion.div>

        {/* Envelope Container */}
        <motion.div
          className="relative mt-8 h-[200px] w-[300px] md:h-[240px] md:w-[360px] cursor-pointer"
          animate={isOpen ? {} : { y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          onClick={!isOpen ? handleOpen : undefined}
        >
          {/* Back of Envelope */}
          <div className="absolute inset-0 rounded-sm bg-[#B88A44] shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />

          {/* Inner Paper (The Invitation Card) */}
          <motion.div
            className="absolute bottom-2 left-2 right-2 rounded bg-[#FAF7F2] p-6 shadow-inner flex items-center justify-start pt-8 flex-col text-center"
            initial={{ y: "10%", height: "90%", zIndex: 10 }}
            animate={
              isOpen
                ? { y: "-65%", height: "120%", zIndex: 30 }
                : { y: "10%", height: "90%", zIndex: 10 }
            }
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[#0F1B2D] font-sans text-xs tracking-widest uppercase mb-2 opacity-70">
              Para
            </p>
            <h3 className="font-heading text-2xl md:text-3xl text-[#0F1B2D]">
              {guest.fullName}
            </h3>
            {isOpen && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-4 text-[#9B3A4E] text-sm italic font-serif"
              >
                Abriendo invitación...
              </motion.p>
            )}
          </motion.div>

          {/* Front Flaps of Envelope */}
          {/* Left Flap */}
          <div className="absolute bottom-0 left-0 h-0 w-0 border-b-[100px] md:border-b-[120px] border-l-[150px] md:border-l-[180px] border-b-[#C49A60] border-l-transparent z-20" />
          {/* Right Flap */}
          <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[100px] md:border-b-[120px] border-r-[150px] md:border-r-[180px] border-b-[#C49A60] border-r-transparent z-20" />
          {/* Bottom Flap */}
          <div className="absolute bottom-0 left-0 right-0 h-0 w-0 border-b-[120px] md:border-b-[140px] border-l-[150px] md:border-l-[180px] border-r-[150px] md:border-r-[180px] border-b-[#D4AF7A] border-l-transparent border-r-transparent z-25" />
          
          {/* Top Flap */}
          <motion.div
            className="absolute top-0 left-0 h-0 w-0 border-l-[150px] md:border-l-[180px] border-r-[150px] md:border-r-[180px] border-t-[110px] md:border-t-[130px] border-l-transparent border-r-transparent border-t-[#C49A60] origin-top"
            initial={{ rotateX: 0, zIndex: 40 }}
            animate={isOpen ? { rotateX: 180, zIndex: 5 } : { rotateX: 0, zIndex: 40 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

          {/* Wax Seal */}
          <motion.div
            className="absolute left-1/2 top-1/2 z-50 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#9B3A4E] shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
            animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
             {/* Sello interno decorativo */}
             <div className="absolute inset-1 rounded-full border border-white/20"></div>
             <span className="font-display text-2xl text-[#F4E3C5] drop-shadow-md">
                {event.title.split("&")[0][0]} & {event.title.split("&")[1]?.trim()[0] || "?"}
             </span>
          </motion.div>
        </motion.div>

        {!isOpen && (
          <motion.p
            className="mt-12 font-sans text-xs tracking-widest text-[var(--color-champagne)]/70 uppercase"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Toca el sobre para abrir
          </motion.p>
        )}
      </div>
    </div>
  );
}
