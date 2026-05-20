"use client";

import { useState, useRef, useTransition } from "react";
import {
  Users,
  Plus,
  Trash2,
  Upload,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Download,
} from "lucide-react";
import Papa from "papaparse";
import { addClientGuest, removeClientGuest, importClientGuests } from "@/app/actions/portal";
import type { PortalGuestData } from "@/app/actions/portal";

interface Props {
  clientToken: string;
  slug: string;
  isActive: boolean;
  initialGuests: PortalGuestData[];
  maxGuests: number | null;
}

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || "https://momentum-alpha-six.vercel.app";

export function GuestManager({ clientToken, slug, isActive, initialGuests, maxGuests }: Props) {
  const [guests, setGuests] = useState<PortalGuestData[]>(initialGuests);
  const [showForm, setShowForm] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Add form state ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({ name: "", phone: "", email: "", allowedGuests: 1 });
  const [formError, setFormError] = useState("");

  // ── CSV state ───────────────────────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvPreview, setCsvPreview] = useState<Array<{ name: string; phone?: string; email?: string; allowedGuests?: number }>>([]);
  const [csvError, setCsvError] = useState("");
  const [csvResult, setCsvResult] = useState<{ created: number; failed: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

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
    if (maxGuests !== null && guests.length >= maxGuests) {
      setFormError(`Tu plan permite máximo ${maxGuests} invitados`);
      return;
    }
    setFormError("");
    startTransition(async () => {
      const result = await addClientGuest(clientToken, {
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
      const result = await removeClientGuest(clientToken, guestId);
      if (result.success) {
        setGuests((prev) => prev.filter((g) => g.id !== guestId));
      }
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError("");
    setCsvResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = (results.data as Record<string, string>[]).map((row) => ({
          name: row.nombre || row.name || row.Nombre || row.Name || "",
          phone: row.telefono || row.phone || row.celular || row.Celular || undefined,
          email: row.email || row.correo || row.Email || row.Correo || undefined,
          allowedGuests: Number(row.acompañantes || row.companions || row.guests || 1),
        })).filter((r) => r.name.trim());

        if (rows.length === 0) {
          setCsvError("No se encontraron filas válidas. Asegúrate de tener una columna 'nombre'.");
          return;
        }
        setCsvPreview(rows);
      },
      error: () => setCsvError("Error al leer el archivo CSV"),
    });
  }

  async function handleImport() {
    if (csvPreview.length === 0) return;
    setIsImporting(true);
    const result = await importClientGuests(clientToken, csvPreview);
    setIsImporting(false);

    if (result.success) {
      setCsvResult({ created: result.created ?? 0, failed: result.failed ?? 0 });
      setCsvPreview([]);
      if (fileRef.current) fileRef.current.value = "";
      // Reload guests from server — simplest approach: full reload
      window.location.reload();
    } else {
      setCsvError(result.error ?? "Error al importar");
    }
  }

  function downloadTemplate() {
    const csv = "nombre,telefono,email,acompañantes\nJuan Pérez,+525551234567,juan@ejemplo.com,2";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "plantilla_invitados.csv";
    a.click();
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-[var(--color-champagne)]" />
          <div>
            <h2 className="text-base font-bold text-[var(--color-midnight)]">
              Lista de invitados
            </h2>
            <p className="text-xs text-[var(--color-midnight)]/50">
              {guests.length === 0
                ? "Agrega invitados para enviarles su link personalizado"
                : `${guests.length}${maxGuests ? `/${maxGuests}` : ""} invitado${guests.length !== 1 ? "s" : ""} registrado${guests.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[var(--color-champagne)]/15 px-3 py-1 text-xs font-bold text-[var(--color-midnight)]">
          {guests.length}
        </span>
      </div>

      {/* Guest list */}
      {guests.length > 0 && (
        <div className="divide-y divide-black/5 rounded-xl border border-black/8 overflow-hidden">
          {guests.map((guest) => (
            <div key={guest.id} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-black/[0.01] transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--color-midnight)] truncate">{guest.name}</p>
                {guest.phone && (
                  <p className="text-xs text-[var(--color-midnight)]/50 truncate">{guest.phone}</p>
                )}
              </div>

              {/* RSVP badge */}
              {guest.rsvpStatus && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  guest.rsvpStatus === "CONFIRMED"
                    ? "bg-emerald-100 text-emerald-700"
                    : guest.rsvpStatus === "DECLINED"
                    ? "bg-red-100 text-red-600"
                    : "bg-black/5 text-[var(--color-midnight)]/40"
                }`}>
                  {guest.rsvpStatus === "CONFIRMED" ? "Confirmado" : guest.rsvpStatus === "DECLINED" ? "Declina" : "Pendiente"}
                </span>
              )}

              {/* Copy link (only when ACTIVE) */}
              {isActive && (
                <button
                  onClick={() => copyLink(guest.uniqueToken)}
                  title="Copiar link personalizado"
                  className="shrink-0 rounded-lg p-1.5 text-[var(--color-midnight)]/40 hover:bg-black/5 hover:text-[var(--color-midnight)] transition-colors"
                >
                  {copiedId === guest.uniqueToken ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}

              {/* Remove */}
              {!guest.rsvpStatus && (
                <button
                  onClick={() => handleRemove(guest.id)}
                  disabled={isPending}
                  title="Eliminar invitado"
                  className="shrink-0 rounded-lg p-1.5 text-[var(--color-midnight)]/30 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isActive && guests.length > 0 && (
        <p className="text-xs text-[var(--color-midnight)]/40 text-center">
          Copia el link de cada invitado y envíaselo por WhatsApp
        </p>
      )}

      {/* Add guest form */}
      <div className="space-y-3">
        {maxGuests !== null && guests.length >= maxGuests && (
          <p className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-2 text-xs font-semibold text-amber-700 text-center">
            Límite de {maxGuests} invitados alcanzado en tu plan Pro
          </p>
        )}
        <button
          onClick={() => { setShowForm(!showForm); setShowCsv(false); }}
          disabled={maxGuests !== null && guests.length >= maxGuests}
          className="w-full flex items-center justify-between rounded-xl border border-dashed border-black/15 px-4 py-3 text-sm font-semibold text-[var(--color-midnight)]/60 hover:border-[var(--color-champagne)] hover:text-[var(--color-midnight)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Agregar invitado
          </span>
          {showForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showForm && (
          <div className="rounded-xl border border-black/8 bg-[var(--color-cream)] p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-midnight)]/60 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre completo"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-midnight)] placeholder:text-black/30 focus:border-[var(--color-champagne)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-midnight)]/60 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+52 55 1234 5678"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-midnight)] placeholder:text-black/30 focus:border-[var(--color-champagne)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-midnight)]/60 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@ejemplo.com"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-midnight)] placeholder:text-black/30 focus:border-[var(--color-champagne)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-midnight)]/60 mb-1">
                  Acompañantes permitidos
                </label>
                <select
                  value={form.allowedGuests}
                  onChange={(e) => setForm((f) => ({ ...f, allowedGuests: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-midnight)] focus:border-[var(--color-champagne)] focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-xs text-red-500">{formError}</p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowForm(false); setFormError(""); }}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-[var(--color-midnight)]/60 hover:bg-black/5 transition-colors"
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

      {/* CSV upload */}
      <div className="space-y-3">
        <button
          onClick={() => { setShowCsv(!showCsv); setShowForm(false); }}
          className="w-full flex items-center justify-between rounded-xl border border-dashed border-black/15 px-4 py-3 text-sm font-semibold text-[var(--color-midnight)]/60 hover:border-[var(--color-champagne)] hover:text-[var(--color-midnight)] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Subir lista en Excel / CSV
          </span>
          {showCsv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showCsv && (
          <div className="rounded-xl border border-black/8 bg-[var(--color-cream)] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--color-midnight)]/60">
                Columnas: <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[10px]">nombre</code>,{" "}
                <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[10px]">telefono</code>,{" "}
                <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[10px]">email</code>,{" "}
                <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[10px]">acompañantes</code>
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--color-champagne)] hover:underline"
              >
                <Download className="h-3 w-3" />
                Plantilla
              </button>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/10 p-6 text-center transition-colors hover:border-[var(--color-champagne)] hover:bg-white"
            >
              <Upload className="h-6 w-6 text-[var(--color-midnight)]/30 mb-2" />
              <p className="text-sm font-semibold text-[var(--color-midnight)]/60">
                {csvPreview.length > 0 ? `${csvPreview.length} filas listas` : "Selecciona tu archivo CSV"}
              </p>
              <p className="text-xs text-[var(--color-midnight)]/40">
                También puedes exportar desde Excel como CSV
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {csvError && (
              <p className="text-xs text-red-500">{csvError}</p>
            )}

            {csvResult && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm font-semibold text-emerald-700">
                ✓ {csvResult.created} invitados importados
                {csvResult.failed > 0 && `, ${csvResult.failed} omitidos`}
              </div>
            )}

            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--color-midnight)]/50 uppercase tracking-wider">
                  Vista previa ({csvPreview.length} filas)
                </p>
                <div className="max-h-40 overflow-y-auto divide-y divide-black/5 rounded-lg border border-black/8 bg-white">
                  {csvPreview.slice(0, 10).map((row, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 text-xs">
                      <span className="font-semibold text-[var(--color-midnight)] truncate flex-1">{row.name}</span>
                      {row.phone && <span className="text-[var(--color-midnight)]/50 shrink-0">{row.phone}</span>}
                    </div>
                  ))}
                  {csvPreview.length > 10 && (
                    <div className="px-3 py-2 text-xs text-[var(--color-midnight)]/40 text-center">
                      … y {csvPreview.length - 10} más
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setCsvPreview([]); if (fileRef.current) fileRef.current.value = ""; }}
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-[var(--color-midnight)]/60 hover:bg-black/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-midnight)] px-4 py-2 text-xs font-bold text-[var(--color-cream)] hover:opacity-80 disabled:opacity-50 transition-opacity"
                  >
                    {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {isImporting ? "Importando..." : `Importar ${csvPreview.length} invitados`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
