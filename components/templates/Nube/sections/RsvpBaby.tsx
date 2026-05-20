"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { submitRsvp } from "@/app/actions/rsvp";

export function RsvpBaby({
  guest,
  eventSlug,
  guestToken,
  primaryColor,
}: {
  guest: any;
  eventSlug: string;
  guestToken: string;
  primaryColor: string;
}) {
  const [status, setStatus] = useState<"idle" | "attending" | "declined">("idle");
  const [companions, setCompanions] = useState(0);
  const [message, setMessage] = useState("");
  const [bringingGift, setBringingGift] = useState(false);
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
    if (guest.rsvp.message) {
      if (guest.rsvp.message.includes("[Traerá regalo]")) {
        setBringingGift(true);
        setMessage(guest.rsvp.message.replace("[Traerá regalo]\n", ""));
      } else {
        setMessage(guest.rsvp.message);
      }
    }
  }, [guest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    
    // Adjuntamos la información del regalo al mensaje
    const finalMessage = bringingGift && status === "attending" 
      ? `[Traerá regalo]\n${message}` 
      : message;

    const res = await submitRsvp({
      guestId: guest.id,
      status: status === "attending" ? "CONFIRMED" : "DECLINED",
      confirmedGuests: status === "attending" ? companions : 0,
      message: finalMessage,
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

  const guestFirst = guest?.name?.split(" ")[0] ?? guest?.name;

  if (isSubmitted) {
    return (
      <section className="w-full bg-[#F9FBFC] py-32 px-4 text-center">
        <motion.div
          className="mx-auto max-w-md p-10 rounded-[3rem] shadow-sm border border-[#ecf0f1] bg-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-4xl mb-6">{status === "attending" ? "🍼" : "💌"}</div>
          <h2 className="font-sans font-bold text-3xl mb-4 text-[#2c3e50]">
            ¡Gracias, {guestFirst}!
          </h2>
          <p className="text-[#7f8c8d] text-lg mb-8 font-medium">
            {status === "attending"
              ? `Hemos registrado tu asistencia. ¡Qué emoción compartir esto contigo!`
              : "Lamentamos que no puedas acompañarnos. Agradecemos que nos hayas avisado."}
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-sm font-bold underline transition-colors"
            style={{ color: primaryColor }}
          >
            Modificar mi respuesta
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#F9FBFC] py-32 px-4">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-sans text-4xl md:text-5xl font-bold text-[#2c3e50] mb-6">
            Confirma tu Asistencia
          </h2>
          <p className="text-[#7f8c8d] text-lg font-medium max-w-lg mx-auto">
            Ayúdanos a organizar este día confirmando tu asistencia.
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
                className="px-10 py-5 rounded-full font-bold text-lg text-white shadow-md w-full sm:w-auto"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sí, asistiré
              </motion.button>
              <button
                onClick={() => setStatus("declined")}
                className="px-10 py-5 rounded-full font-bold text-lg border border-[#bdc3c7] text-[#7f8c8d] hover:bg-[#ecf0f1] transition w-full sm:w-auto bg-white"
              >
                No podré ir
              </button>
            </motion.div>
          )}

          {status === "attending" && (
            <motion.form
              key="attending-form"
              onSubmit={handleSubmit}
              className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-[#ecf0f1] max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-sans text-2xl font-bold text-[#2c3e50] mb-8 text-center">
                ¡Qué emoción, {guestFirst}!
              </h3>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-[#7f8c8d] mb-3 uppercase tracking-wider">
                    Acompañantes ({guest.allowedGuests} max)
                  </label>
                  <select
                    className="w-full bg-[#F9FBFC] border border-[#ecf0f1] rounded-2xl px-4 py-4 text-[#2c3e50] font-bold focus:outline-none transition-colors"
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

                <div className="flex items-start gap-3 p-4 bg-[#F9FBFC] rounded-2xl border border-[#ecf0f1]">
                  <input 
                    type="checkbox" 
                    id="gift"
                    checked={bringingGift}
                    onChange={(e) => setBringingGift(e.target.checked)}
                    className="w-5 h-5 rounded mt-0.5"
                    style={{ accentColor: primaryColor }}
                  />
                  <label htmlFor="gift" className="text-[#34495e] font-medium cursor-pointer">
                    Llevaré un detalle de la mesa de regalos
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#7f8c8d] mb-3 uppercase tracking-wider">
                    Déjanos un mensaje (Opcional)
                  </label>
                  <textarea
                    className="w-full bg-[#F9FBFC] border border-[#ecf0f1] rounded-2xl px-4 py-4 text-[#2c3e50] font-medium focus:outline-none min-h-[120px] resize-none transition-colors"
                    placeholder="¡Felicidades por esta nueva etapa!..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ outlineColor: primaryColor }}
                  />
                </div>

                {errorMsg && (
                  <p className="text-red-500 text-sm text-center font-bold">{errorMsg}</p>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="flex-1 px-6 py-4 rounded-full font-bold border border-[#bdc3c7] text-[#7f8c8d] hover:bg-[#ecf0f1] transition bg-white"
                  >
                    Volver
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 rounded-full font-bold text-white shadow-md disabled:opacity-50"
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
              className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-[#ecf0f1] max-w-xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-sans text-2xl font-bold text-[#2c3e50] mb-4">
                Te extrañaremos, {guestFirst}
              </h3>
              <p className="text-[#7f8c8d] mb-8 font-medium">
                ¿Deseas dejarnos un mensaje?
              </p>

              <textarea
                className="w-full bg-[#F9FBFC] border border-[#ecf0f1] rounded-2xl px-4 py-4 text-[#2c3e50] min-h-[120px] mb-8 resize-none focus:outline-none text-left font-medium"
                placeholder="Lamento mucho no poder acompañarlos..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ outlineColor: primaryColor }}
              />

              {errorMsg && (
                <p className="text-red-500 text-sm mb-4 font-bold">{errorMsg}</p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="flex-1 px-6 py-4 rounded-full font-bold border border-[#bdc3c7] text-[#7f8c8d] hover:bg-[#ecf0f1] transition bg-white"
                >
                  Volver
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 rounded-full font-bold text-white shadow-md disabled:opacity-50"
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
