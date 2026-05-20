"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { submitRsvp } from "@/app/actions/rsvp";

export function RsvpBloom({
  guest,
  eventSlug,
  guestToken,
  primaryColor,
  celebrantName,
}: {
  guest: any;
  eventSlug: string;
  guestToken: string;
  primaryColor: string;
  celebrantName: string;
}) {
  const [status, setStatus] = useState<"idle" | "attending" | "declined">("idle");
  const [companions, setCompanions] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!guest?.rsvp) return;
    if (guest.rsvp.status === "CONFIRMED") {
      setStatus("attending");
      setIsSubmitted(true);
      setCompanions(guest.rsvp.confirmedGuests ?? 0);
    } else if (guest.rsvp.status === "DECLINED") {
      setStatus("declined");
      setIsSubmitted(true);
    }
    if (guest.rsvp.message) setMessage(guest.rsvp.message);
  }, [guest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    const res = await submitRsvp({
      guestId: guest.id,
      status: status === "attending" ? "CONFIRMED" : "DECLINED",
      confirmedGuests: status === "attending" ? companions : 0,
      message,
      eventSlug,
      guestToken,
    });
    setIsSubmitting(false);
    if (res.success) {
      setIsSubmitted(true);
    } else {
      setErrorMsg(res.error ?? "Ocurrió un error");
    }
  };

  const firstName = celebrantName?.split(" ")[0] ?? celebrantName;
  const guestFirst = guest?.name?.split(" ")[0] ?? guest?.name;

  if (isSubmitted) {
    return (
      <section className="w-full bg-[#FAFAFA] py-32 px-4 text-center">
        <motion.div
          className="mx-auto max-w-md p-10 rounded-[2rem] shadow-sm border border-[#f0f0f0] bg-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-4xl mb-6">{status === "attending" ? "🌸" : "💌"}</div>
          <h2 className="font-serif text-3xl mb-4 text-[#2c2c2c]">
            ¡Gracias, {guestFirst}!
          </h2>
          <p className="text-[#666] text-lg mb-8 font-light">
            {status === "attending"
              ? `Hemos registrado tu asistencia. ¡Nos vemos en los XV de ${firstName}!`
              : "Lamentamos que no puedas acompañarnos. Agradecemos que nos hayas avisado."}
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-sm font-medium underline transition-colors"
            style={{ color: primaryColor }}
          >
            Modificar mi respuesta
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#FAFAFA] py-32 px-4">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-4xl md:text-5xl text-[#2c2c2c] mb-6">
            Confirma tu Asistencia
          </h2>
          <p className="text-[#666] text-lg font-light max-w-lg mx-auto">
            Por favor, confírmanos si podrás acompañarnos en este día tan especial.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="buttons"
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <motion.button
                onClick={() => setStatus("attending")}
                className="px-10 py-4 rounded-full font-medium text-lg text-white shadow-sm w-full sm:w-auto"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sí, asistiré
              </motion.button>
              <button
                onClick={() => setStatus("declined")}
                className="px-10 py-4 rounded-full font-medium text-lg border border-[#d0d0d0] text-[#666] hover:bg-[#f0f0f0] transition w-full sm:w-auto bg-white"
              >
                No podré ir
              </button>
            </motion.div>
          )}

          {status === "attending" && (
            <motion.form
              key="attending-form"
              onSubmit={handleSubmit}
              className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-[#f0f0f0] max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-serif text-2xl text-[#2c2c2c] mb-8 text-center">
                ¡Qué emoción, {guestFirst}!
              </h3>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-[#666] mb-3 uppercase tracking-wider">
                    Pases adicionales ({guest.allowedGuests} max)
                  </label>
                  <select
                    className="w-full bg-[#FAFAFA] border border-[#e0e0e0] rounded-xl px-4 py-3 text-[#333] focus:outline-none transition-colors"
                    value={companions}
                    onChange={(e) => setCompanions(Number(e.target.value))}
                    style={{ outlineColor: primaryColor }}
                  >
                    {[...Array((guest.allowedGuests ?? 0) + 1)].map((_, i) => (
                      <option key={i} value={i}>
                        {i} acompañante{i !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#666] mb-3 uppercase tracking-wider">
                    Mensaje para {firstName} (Opcional)
                  </label>
                  <textarea
                    className="w-full bg-[#FAFAFA] border border-[#e0e0e0] rounded-xl px-4 py-3 text-[#333] focus:outline-none min-h-[120px] resize-none transition-colors"
                    placeholder="¡Felicidades en tus XV!..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {errorMsg && (
                  <p className="text-red-500 text-sm text-center">{errorMsg}</p>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="flex-1 px-6 py-4 rounded-full font-medium border border-[#d0d0d0] text-[#666] hover:bg-[#f0f0f0] transition bg-white"
                  >
                    Volver
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 rounded-full font-medium text-white shadow-sm disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                    whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isSubmitting ? "Enviando..." : "Confirmar"}
                  </motion.button>
                </div>
              </div>
            </motion.form>
          )}

          {status === "declined" && (
            <motion.form
              key="declined-form"
              onSubmit={handleSubmit}
              className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-[#f0f0f0] max-w-xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-serif text-2xl text-[#2c2c2c] mb-4">
                Te extrañaremos, {guestFirst}
              </h3>
              <p className="text-[#666] mb-8 font-light">
                Si deseas dejar un mensaje para {firstName}:
              </p>

              <textarea
                className="w-full bg-[#FAFAFA] border border-[#e0e0e0] rounded-xl px-4 py-3 text-[#333] min-h-[120px] mb-8 resize-none focus:outline-none text-left"
                placeholder="Lamento mucho no poder acompañarte..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              {errorMsg && (
                <p className="text-red-500 text-sm mb-4">{errorMsg}</p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="flex-1 px-6 py-4 rounded-full font-medium border border-[#d0d0d0] text-[#666] hover:bg-[#f0f0f0] transition bg-white"
                >
                  Volver
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 rounded-full font-medium text-white shadow-sm disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                  whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
