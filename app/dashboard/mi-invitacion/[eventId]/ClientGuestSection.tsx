"use client";

import { useState, useTransition } from "react";
import { Users, Plus, Trash2, Copy, Check, ChevronDown, ChevronUp, Loader2, Eye } from "lucide-react";
import { addClientGuest, removeClientGuest, type ClientEventData } from "@/app/actions/client-event";

type Guest = ClientEventData["guests"][0];

interface Props {
  eventId: string;
  slug: string;
  initialGuests: Guest[];
  isActive: boolean;
  isFree: boolean;
}

const FREE_GUEST_LIMIT = 20;

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || "https://momentum-alpha-six.vercel.app";

export function ClientGuestSection({ eventId, slug, initialGuests, isActive, isFree }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", allowedGuests: 1 });
  const [formError, setFormError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const guestLimit = isFree ? FREE_GUEST_LIMIT : null;
  const atLimit = guestLimit !== null && guests.length >= guestLimit;

  function guestLink(token: string) {
    return `${BASE_URL}/e/${slug}/${token}`;
  }

  async function copyLink(token: string) {
    await navigator.clipboard.writeText(guestLink(token));
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleAdd() {
    if (!form.name.trim()) { setFormError("El nombre es requerido"); return; }
    if (atLimit) { setFormError(`Límite de ${guestLimit} invitados en invitación gratis`); return; }
    setFormError("");
    startTransition(async () => {
      const result = await addClientGuest(eventId, {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        allowedGuests: form.allowedGuests,
      });
      if (result.success && result.guest) {
        setGuests((prev) => [...prev, result.guest!]);
        setForm({ name: "", phone: "", email: "", allowedGuests: 1 });
        setShowForm(false);
      } else {
        setFormError(result.error ?? "Error al agregar");
      }
    });
  }

  function handleRemove(guestId: string) {
    startTransition(async () => {
      const result = await removeClientGuest(eventId, guestId);
      if (result.success) setGuests((prev) => prev.filter((g) => g.id !== guestId));
    });
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/40 focus:border-[var(--color-champagne)] focus:outline-none focus:ring-2 focus:ring-[var(--color-champagne)]/20 transition-all";

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-[var(--color-champagne)]" />
          <div>
            <h2 className="text-base font-bold">Lista de invitados</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {guests.length === 0
                ? "Agrega invitados para enviarles su link personalizado"
                : `${guests.length}${guestLimit ? `/${guestLimit}` : ""} invitado${guests.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
          {guests.length}
        </span>
      </div>

      <div className="p-6 space-y-4">
        {/* Free limit warning */}
        {isFree && (
          <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 text-xs text-muted-foreground">
            Invitación gratis — máximo {FREE_GUEST_LIMIT} invitados. Los links personalizados estarán disponibles cuando tu invitación esté activa.
          </div>
        )}

        {/* Guest list */}
        {guests.length > 0 && (
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {guests.map((guest) => (
              <div key={guest.id} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{guest.name}</p>
                  {guest.phone && (
                    <p className="text-xs text-muted-foreground truncate">{guest.phone}</p>
                  )}
                </div>

                {/* Views badge */}
                {isActive && guest.viewCount > 0 && (
                  <span className="shrink-0 flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    <Eye className="h-2.5 w-2.5" />
                    {guest.viewCount}
                  </span>
                )}

                {/* RSVP badge */}
                {guest.rsvpStatus && (
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    guest.rsvpStatus === "CONFIRMED"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : guest.rsvpStatus === "DECLINED"
                      ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {guest.rsvpStatus === "CONFIRMED" ? "Confirmado" : guest.rsvpStatus === "DECLINED" ? "Declina" : "Pendiente"}
                  </span>
                )}

                {/* Copy link (active only) */}
                {isActive && (
                  <button
                    onClick={() => copyLink(guest.uniqueToken)}
                    title="Copiar link personalizado"
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {copiedId === guest.uniqueToken ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}

                {/* Remove (only if no RSVP yet) */}
                {!guest.rsvpStatus && (
                  <button
                    onClick={() => handleRemove(guest.id)}
                    disabled={isPending}
                    title="Eliminar invitado"
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground/30 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {isActive && guests.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Copia el link de cada invitado y envíaselo por WhatsApp o email
          </p>
        )}

        {/* Add guest toggle */}
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={atLimit}
          className="w-full flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-[var(--color-champagne)] hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {atLimit ? `Límite de ${guestLimit} invitados alcanzado` : "Agregar invitado"}
          </span>
          {!atLimit && (showForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
        </button>

        {showForm && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre completo"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+52 55 1234 5678"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@ejemplo.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Acompañantes</label>
                <select
                  value={form.allowedGuests}
                  onChange={(e) => setForm((f) => ({ ...f, allowedGuests: Number(e.target.value) }))}
                  className={inputCls}
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
                  ))}
                </select>
              </div>
            </div>

            {formError && <p className="text-xs text-red-500">{formError}</p>}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowForm(false); setFormError(""); }}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-midnight)] px-4 py-2 text-xs font-bold text-[var(--color-cream)] hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
