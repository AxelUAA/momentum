"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { submitRsvp } from "@/app/actions/rsvp";

export function RsvpForm({ 
  guest, 
  eventSlug, 
  guestToken 
}: { 
  guest: any; 
  eventSlug: string; 
  guestToken: string; 
}) {
  const [status, setStatus] = useState<"idle" | "attending" | "declined">("idle");
  const [companions, setCompanions] = useState(0);
  const [menu, setMenu] = useState("Pollo");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (guest?.rsvp) {
      if (guest.rsvp.status === "CONFIRMED") {
        setStatus("attending");
        setIsSubmitted(true);
        setCompanions(guest.rsvp.companionsConfirmed);
      } else if (guest.rsvp.status === "DECLINED") {
        setStatus("declined");
        setIsSubmitted(true);
      }
      if (guest.rsvp.message) {
        // Simple extraction just for the message textarea if we really wanted to parse the notes string,
        // but since we combined them, we'll just put the whole string in the message box for now
        // Or leave it empty.
        setMessage(guest.rsvp.message);
      }
    }
  }, [guest]);

  const handleAttend = () => {
    setStatus("attending");
    // Confeti de celebración
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#D4AF7A", "#9B3A4E", "#F4E3C5"]
    });
  };

  const handleDecline = () => {
    setStatus("declined");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    
    const res = await submitRsvp({
      guestId: guest.id,
      status: status === "attending" ? "CONFIRMED" : "DECLINED",
      companionsConfirmed: status === "attending" ? companions : 0,
      menuPreference: status === "attending" ? menu : undefined,
      message: message,
      eventSlug,
      guestToken
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
    } else {
      setErrorMsg(res.error || "Ocurrió un error");
    }
  };

  if (isSubmitted) {
    return (
      <section className="w-full bg-[#0F1B2D] py-24 px-4 text-center">
        <motion.div 
          className="mx-auto max-w-md p-8 rounded-2xl bg-[#1B3A5C]/30 border border-[var(--color-champagne)]/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="font-heading text-4xl text-[var(--color-champagne)] mb-4">
            ¡Gracias!
          </h2>
          <p className="text-[#F4E3C5]/80 mb-6">
            {status === "attending" 
              ? "Hemos registrado tu asistencia. ¡Nos vemos en la fiesta!" 
              : "Lamentamos que no puedas acompañarnos, gracias por avisarnos."}
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="text-[var(--color-champagne)] underline text-sm hover:text-white"
          >
            Editar mi respuesta
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#0F1B2D] py-24 px-4 border-t border-[var(--color-champagne)]/10">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <motion.h2 
            className="font-heading text-4xl md:text-6xl text-[#F4E3C5] mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Confirmar Asistencia
          </motion.h2>
          <motion.p 
            className="text-[#F4E3C5]/70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Por favor confírmanos antes del 1 de Junio, 2026
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div 
              key="buttons"
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button 
                onClick={handleAttend}
                className="px-8 py-4 rounded-full bg-[var(--color-champagne)] text-[#0F1B2D] font-medium hover:bg-[#F4E3C5] transition shadow-lg w-full sm:w-auto"
              >
                Sí, asistiré
              </button>
              <button 
                onClick={handleDecline}
                className="px-8 py-4 rounded-full bg-transparent border border-[#F4E3C5]/30 text-[#F4E3C5] hover:bg-white/5 transition w-full sm:w-auto"
              >
                No podré ir
              </button>
            </motion.div>
          )}

          {status === "attending" && (
            <motion.form 
              key="attending-form"
              onSubmit={handleSubmit}
              className="bg-[#1B3A5C]/40 p-6 md:p-10 rounded-3xl border border-[var(--color-champagne)]/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-heading text-2xl text-[var(--color-champagne)] mb-6 text-center">
                ¡Te esperamos, {guest.fullName.split(' ')[0]}!
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-[#F4E3C5]/70 mb-2 uppercase tracking-wider">
                    Pases adicionales ({guest.maxCompanions} max)
                  </label>
                  <select 
                    className="w-full bg-[#0F1B2D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-champagne)]"
                    value={companions}
                    onChange={(e) => setCompanions(Number(e.target.value))}
                  >
                    {[...Array(guest.maxCompanions + 1)].map((_, i) => (
                      <option key={i} value={i}>{i} acompañante{i !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#F4E3C5]/70 mb-2 uppercase tracking-wider">
                    Preferencia de Menú
                  </label>
                  <div className="flex gap-4">
                    {['Pollo', 'Pescado', 'Vegetariano'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-white cursor-pointer">
                        <input 
                          type="radio" 
                          name="menu" 
                          value={opt} 
                          checked={menu === opt}
                          onChange={(e) => setMenu(e.target.value)}
                          className="accent-[var(--color-champagne)]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#F4E3C5]/70 mb-2 uppercase tracking-wider">
                    Mensaje para los novios (Opcional)
                  </label>
                  <textarea 
                    className="w-full bg-[#0F1B2D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-champagne)] min-h-[100px]"
                    placeholder="¡Felicidades!..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 rounded-full bg-[var(--color-champagne)] text-[#0F1B2D] font-medium hover:bg-[#F4E3C5] transition shadow-lg mt-4 disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Confirmar mi asistencia"}
                </button>
              </div>
            </motion.form>
          )}

          {status === "declined" && (
            <motion.form 
              key="declined-form"
              onSubmit={handleSubmit}
              className="bg-[#1B3A5C]/40 p-6 md:p-10 rounded-3xl border border-white/10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-heading text-2xl text-[#F4E3C5] mb-4">
                Te vamos a extrañar, {guest.fullName.split(' ')[0]}
              </h3>
              <p className="text-[#F4E3C5]/60 mb-6">
                Si deseas dejar un mensaje a los novios:
              </p>
              <textarea 
                className="w-full bg-[#0F1B2D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 min-h-[100px] mb-6"
                placeholder="Lamento mucho no poder acompañarlos..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {errorMsg && <p className="text-red-400 text-sm mb-4">{errorMsg}</p>}
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="flex-1 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white"
                >
                  Volver
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-full bg-white text-[#0F1B2D] font-medium"
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
