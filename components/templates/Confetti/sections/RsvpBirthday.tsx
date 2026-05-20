"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { submitRsvp } from "@/app/actions/rsvp";

export function RsvpBirthday({
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

  const handleAttend = () => {
    setStatus("attending");
    confetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.6 },
      colors: [primaryColor, "#FFD166", "#06D6A0", "#EF476F", "#FFFFFF"],
    });
  };

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
      <section className="w-full bg-white py-24 px-4 text-center">
        <motion.div
          className="mx-auto max-w-md p-8 rounded-3xl shadow-xl border-4 bg-[#FFFBF5]"
          style={{ borderColor: primaryColor }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">{status === "attending" ? "🎉" : "💌"}</div>
          <h2 className="font-black text-4xl mb-3" style={{ color: primaryColor }}>
            ¡Gracias!
          </h2>
          <p className="text-[#555] text-lg mb-6">
            {status === "attending"
              ? `¡Nos vemos en la fiesta de ${firstName}!`
              : "Lamentamos que no puedas acompañarnos."}
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-sm font-bold underline"
            style={{ color: primaryColor }}
          >
            Editar mi respuesta
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-24 px-4">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-black text-4xl md:text-6xl text-[#1A1A1A] mb-3">
            ¿Nos acompañas?
          </h2>
          <p className="text-[#666] text-lg">
            Confírmanos tu asistencia a la fiesta
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="buttons"
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <motion.button
                onClick={handleAttend}
                className="px-10 py-5 rounded-full font-black text-xl text-white shadow-xl w-full sm:w-auto"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎊 Sí, asistiré
              </motion.button>
              <button
                onClick={() => setStatus("declined")}
                className="px-10 py-5 rounded-full font-bold text-xl border-2 border-[#ccc] text-[#555] hover:bg-black/5 transition w-full sm:w-auto"
              >
                No podré ir
              </button>
            </motion.div>
          )}

          {status === "attending" && (
            <motion.form
              key="attending-form"
              onSubmit={handleSubmit}
              className="rounded-3xl p-6 md:p-10 shadow-xl border-2"
              style={{
                borderColor: primaryColor,
                backgroundColor: `${primaryColor}08`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-black text-2xl text-[#1A1A1A] mb-6 text-center">
                ¡Te esperamos, {guestFirst}! 🎉
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#555] mb-2 uppercase tracking-wider">
                    Acompañantes ({guest.allowedGuests} máx)
                  </label>
                  <select
                    className="w-full bg-white border-2 border-[#e0e0e0] rounded-2xl px-4 py-3 text-[#1A1A1A] font-bold focus:outline-none"
                    value={companions}
                    onChange={(e) => setCompanions(Number(e.target.value))}
                  >
                    {[...Array((guest.allowedGuests ?? 0) + 1)].map((_, i) => (
                      <option key={i} value={i}>
                        {i} acompañante{i !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#555] mb-2 uppercase tracking-wider">
                    Mensaje (Opcional)
                  </label>
                  <textarea
                    className="w-full bg-white border-2 border-[#e0e0e0] rounded-2xl px-4 py-3 text-[#1A1A1A] focus:outline-none min-h-[100px] resize-none"
                    placeholder="¡Feliz cumpleaños!..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {errorMsg && (
                  <p className="text-red-500 text-sm text-center font-bold">{errorMsg}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-5 rounded-full font-black text-xl text-white shadow-xl disabled:opacity-50 mt-2"
                  style={{ backgroundColor: primaryColor }}
                  whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isSubmitting ? "Enviando..." : "¡Confirmar asistencia!"}
                </motion.button>
              </div>
            </motion.form>
          )}

          {status === "declined" && (
            <motion.form
              key="declined-form"
              onSubmit={handleSubmit}
              className="rounded-3xl p-6 md:p-10 shadow-xl border-2 border-[#e0e0e0] text-center bg-[#FAFAFA]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-black text-2xl text-[#1A1A1A] mb-3">
                Te vamos a extrañar, {guestFirst} 💌
              </h3>
              <p className="text-[#666] mb-6">¿Quieres dejar un mensaje?</p>

              <textarea
                className="w-full bg-white border-2 border-[#e0e0e0] rounded-2xl px-4 py-3 text-[#1A1A1A] min-h-[100px] mb-6 resize-none focus:outline-none"
                placeholder="Lamento mucho no poder acompañarlos..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              {errorMsg && (
                <p className="text-red-500 text-sm mb-4 font-bold">{errorMsg}</p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="flex-1 px-6 py-3 rounded-full font-bold border-2 border-[#ccc] text-[#555] hover:bg-black/5 transition"
                >
                  Volver
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-full font-black text-white shadow disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                  whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
