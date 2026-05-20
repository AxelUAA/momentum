"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { resendPortalLink } from "@/app/actions/portal";

export default function RecuperarPortalPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    await resendPortalLink(email.trim().toLowerCase());
    setStatus("sent");
  }

  return (
    <main className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <span
            className="text-2xl font-bold text-[var(--color-midnight)]"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Momentum
          </span>
        </div>

        <div className="rounded-2xl border border-black/8 bg-white p-8 shadow-sm">

          {status === "sent" ? (
            // ── Estado: enviado ──────────────────────────────────────────
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle className="h-7 w-7 text-emerald-500" />
              </div>
              <h1
                className="text-2xl font-bold text-[var(--color-midnight)] mb-3"
                style={{ fontFamily: "var(--font-fraunces, serif)" }}
              >
                Revisa tu correo
              </h1>
              <p className="text-sm text-[var(--color-midnight)]/60 mb-2">
                Si encontramos una invitación asociada a{" "}
                <strong className="text-[var(--color-midnight)]">{email}</strong>,
                recibirás el link en unos minutos.
              </p>
              <p className="text-xs text-[var(--color-midnight)]/40 mb-8">
                Revisa también tu carpeta de spam o promociones.
              </p>
              <button
                onClick={() => { setStatus("idle"); setEmail(""); }}
                className="text-sm text-[var(--color-midnight)]/50 underline underline-offset-2 hover:text-[var(--color-midnight)]/80 transition-colors"
              >
                Intentar con otro correo
              </button>
            </div>
          ) : (
            // ── Estado: formulario ───────────────────────────────────────
            <>
              <div className="mb-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-champagne)]/20">
                  <Mail className="h-5 w-5 text-[var(--color-champagne)]" />
                </div>
                <h1
                  className="text-2xl font-bold text-[var(--color-midnight)] mb-2"
                  style={{ fontFamily: "var(--font-fraunces, serif)" }}
                >
                  Recupera tu acceso
                </h1>
                <p className="text-sm text-[var(--color-midnight)]/60">
                  Ingresa el correo con el que pagaste y te enviaremos el link
                  a tu portal de invitación.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/50 mb-1.5">
                    Tu correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-black/10 bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-midnight)] placeholder:text-[var(--color-midnight)]/30 focus:border-[var(--color-champagne)] focus:outline-none focus:ring-2 focus:ring-[var(--color-champagne)]/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading" || !email.includes("@")}
                  className="w-full rounded-xl bg-[var(--color-midnight)] py-3.5 text-sm font-bold uppercase tracking-widest text-[var(--color-cream)] hover:bg-[var(--color-midnight)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    "Enviarme mi link →"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-midnight)]/40 hover:text-[var(--color-midnight)]/70 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver al inicio
          </Link>
        </div>

      </div>
    </main>
  );
}
