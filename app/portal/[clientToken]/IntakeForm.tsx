"use client";

import { useState, useRef } from "react";
import { Loader2, CheckCircle, Music, ImagePlus, X } from "lucide-react";
import { submitIntake, type IntakeFormData } from "@/app/actions/portal";
import { uploadPortalImage } from "@/app/actions/upload";
import { TIER_INFO } from "@/lib/event-sections-map";

// Campos que solo incluye el plan LUXURY
const LUXURY_ONLY_KEYS = new Set(["dressCode", "giftRegistry"]);

// ─── Campos específicos por tipo de evento ───────────────────────────────────

type FieldDef = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
};

const TYPE_FIELDS: Record<string, FieldDef[]> = {
  WEDDING: [
    { key: "coupleName",    label: "Nombres de la pareja",        placeholder: "Ej: Axel & Valentina" },
    { key: "ceremonyType",  label: "Tipo de ceremonia",           placeholder: "Religiosa / Civil / Mixta" },
    { key: "colors",        label: "Colores del evento",          placeholder: "Ej: Blanco, champagne y verde" },
    { key: "dressCode",     label: "Código de vestimenta",        placeholder: "Ej: Etiqueta rigurosa" },
    { key: "giftRegistry",  label: "Mesa de regalos",             placeholder: "URL o nombre de tienda (opcional)" },
    { key: "guestCount",    label: "Invitados aprox.",            placeholder: "Ej: 150" },
  ],
  XV: [
    { key: "honoree",       label: "Nombre de la quinceañera",    placeholder: "Ej: Sofía García" },
    { key: "theme",         label: "Tema o estilo",               placeholder: "Ej: Jardín, París, Boho" },
    { key: "colors",        label: "Colores del evento",          placeholder: "Ej: Rosa, blanco y dorado" },
    { key: "chambelanes",   label: "Chambelanes",                 placeholder: "¿Cuántos? ¿Tienen coreografía?" },
    { key: "guestCount",    label: "Invitados aprox.",            placeholder: "Ej: 200" },
  ],
  BIRTHDAY: [
    { key: "honoree",       label: "Nombre del festejado",        placeholder: "Ej: Juan García" },
    { key: "age",           label: "Años que cumple",             placeholder: "Ej: 30" },
    { key: "theme",         label: "Tema o estilo",               placeholder: "Ej: Tropical, años 80" },
    { key: "colors",        label: "Colores del evento",          placeholder: "Ej: Azul y blanco" },
    { key: "guestCount",    label: "Invitados aprox.",            placeholder: "Ej: 80" },
  ],
  CORPORATE: [
    { key: "company",       label: "Empresa / organización",      placeholder: "Nombre de la empresa" },
    { key: "eventKind",     label: "Tipo de evento",              placeholder: "Ej: Convención, lanzamiento, cena" },
    { key: "dressCode",     label: "Dress code",                  placeholder: "Formal / Smart casual / Casual" },
    { key: "guestCount",    label: "Asistentes aprox.",           placeholder: "Ej: 300" },
  ],
  BAPTISM: [
    { key: "honoree",       label: "Nombre del bebé",             placeholder: "Ej: Mateo García" },
    { key: "colors",        label: "Colores del evento",          placeholder: "Ej: Azul y blanco" },
    { key: "guestCount",    label: "Invitados aprox.",            placeholder: "Ej: 60" },
  ],
  GRADUATION: [
    { key: "honoree",       label: "Nombre del graduado",         placeholder: "Ej: Ana Martínez" },
    { key: "school",        label: "Escuela / universidad",       placeholder: "Ej: ITESM" },
    { key: "degree",        label: "Carrera o nivel",             placeholder: "Ej: Ingeniería Industrial" },
    { key: "guestCount",    label: "Invitados aprox.",            placeholder: "Ej: 100" },
  ],
  BABY_SHOWER: [
    { key: "honoree",       label: "Nombre de la mamá",           placeholder: "Ej: María García" },
    { key: "babyName",      label: "Nombre del bebé (si ya tienen)", placeholder: "Opcional" },
    { key: "theme",         label: "Tema o estilo",               placeholder: "Ej: Safari, nubes, arcoíris" },
    { key: "colors",        label: "Colores del evento",          placeholder: "Ej: Rosa y dorado" },
    { key: "guestCount",    label: "Invitados aprox.",            placeholder: "Ej: 40" },
  ],
};

const TYPE_SECTION_LABEL: Record<string, string> = {
  WEDDING:    "Sobre la boda",
  XV:         "Sobre los XV años",
  BIRTHDAY:   "Sobre el cumpleaños",
  CORPORATE:  "Sobre el evento corporativo",
  BAPTISM:    "Sobre el bautizo",
  GRADUATION: "Sobre la graduación",
  BABY_SHOWER:"Sobre el baby shower",
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface IntakeFormProps {
  clientToken: string;
  eventType: string;
  tier: string;
  defaultTitle: string;
  defaultDate: string;
  defaultLocationName: string;
  defaultLocationAddress: string;
  savedTypeFields?: Record<string, string>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function IntakeForm({
  clientToken,
  eventType,
  tier,
  defaultTitle,
  defaultDate,
  defaultLocationName,
  defaultLocationAddress,
  savedTypeFields = {},
}: IntakeFormProps) {
  const isLuxury = tier === "LUXURY" || tier === "COMPLETE";
  const maxGuests = (TIER_INFO as Record<string, { maxGuests: number | null }>)[tier]?.maxGuests ?? null;

  // Para planes no-LUXURY, ocultar campos que no están incluidos
  const typeFieldDefs = (TYPE_FIELDS[eventType] ?? []).filter(
    (f) => isLuxury || !LUXURY_ONLY_KEYS.has(f.key),
  );

  const initialTypeFields = typeFieldDefs.reduce<Record<string, string>>(
    (acc, f) => ({ ...acc, [f.key]: savedTypeFields[f.key] ?? "" }),
    {},
  );
  // Preservar spotifyUrl si ya existe
  if (isLuxury) {
    initialTypeFields.spotifyUrl = savedTypeFields.spotifyUrl ?? "";
  }

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<IntakeFormData>({
    title: defaultTitle,
    eventDate: defaultDate,
    eventTime: "",
    locationName: defaultLocationName,
    locationAddress: defaultLocationAddress,
    coverImageUrl: "",
    intakeNotes: "",
    typeFields: initialTypeFields,
  });

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadPortalImage(fd, clientToken, "cover");
      if (result.success && result.url) {
        update("coverImageUrl", result.url);
      } else {
        setError(result.error ?? "Error al subir la imagen");
      }
    } catch {
      setError("Error de red al subir la imagen");
    } finally {
      setUploadingCover(false);
    }
  }

  function update(field: keyof Omit<IntakeFormData, "typeFields">, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function updateTypeField(key: string, value: string) {
    setForm((prev) => ({
      ...prev,
      typeFields: { ...prev.typeFields, [key]: value },
    }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setError("El nombre del evento es requerido.");
    if (!form.eventDate) return setError("La fecha del evento es requerida.");

    setSaving(true);
    setError(null);
    try {
      const result = await submitIntake(clientToken, form);
      if (result.success) {
        setSaved(true);
      } else {
        setError(result.error ?? "Error desconocido.");
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-black/10 bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-midnight)] placeholder:text-[var(--color-midnight)]/30 focus:border-[var(--color-champagne)] focus:outline-none focus:ring-2 focus:ring-[var(--color-champagne)]/20 transition-all";

  if (saved) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
        <h3 className="text-xl font-bold text-emerald-800 mb-2">
          ¡Información enviada!
        </h3>
        <p className="text-emerald-700 text-sm">
          Nuestro equipo ya recibió tus datos y comenzará a trabajar en tu
          invitación. Te avisaremos cuando el preview esté listo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Campos tipo-específicos ── */}
      {typeFieldDefs.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-champagne)]">
            {TYPE_SECTION_LABEL[eventType] ?? "Detalles del evento"}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {typeFieldDefs.map((f) => (
              <div key={f.key} className={f.multiline ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/60 mb-1.5">
                  {f.label}
                  {f.key === "guestCount" && maxGuests && (
                    <span className="ml-2 text-[10px] font-bold text-[var(--color-champagne)] normal-case tracking-normal">
                      (máx. {maxGuests} en tu plan)
                    </span>
                  )}
                </label>
                {f.multiline ? (
                  <textarea
                    rows={3}
                    value={form.typeFields[f.key] ?? ""}
                    onChange={(e) => updateTypeField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={`${inputCls} resize-none`}
                  />
                ) : (
                  <input
                    type="text"
                    value={form.typeFields[f.key] ?? ""}
                    onChange={(e) => updateTypeField(f.key, e.target.value)}
                    placeholder={f.key === "guestCount" && maxGuests
                      ? `Ej: 80 (límite ${maxGuests})`
                      : f.placeholder}
                    className={inputCls}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-black/5 pt-2" />
        </div>
      )}

      {/* ── Datos del evento ── */}
      <div className="space-y-4">
        {typeFieldDefs.length > 0 && (
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/40">
            Lugar y fecha
          </p>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/60 mb-1.5">
            Nombre del evento *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Ej: Boda Axel & Valentina"
            required
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/60 mb-1.5">
              Fecha *
            </label>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => update("eventDate", e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/60 mb-1.5">
              Hora
            </label>
            <input
              type="time"
              value={form.eventTime}
              onChange={(e) => update("eventTime", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/60 mb-1.5">
            Nombre del lugar / salón
          </label>
          <input
            type="text"
            value={form.locationName}
            onChange={(e) => update("locationName", e.target.value)}
            placeholder="Ej: Hacienda San Miguel"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/60 mb-1.5">
            Dirección completa
          </label>
          <input
            type="text"
            value={form.locationAddress}
            onChange={(e) => update("locationAddress", e.target.value)}
            placeholder="Ej: Calle Hidalgo 123, Col. Centro, CDMX"
            className={inputCls}
          />
        </div>
      </div>

      {/* ── Foto de portada ── */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/60 mb-1.5">
          Foto de portada (opcional)
        </label>
        {form.coverImageUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-black/10">
            <img src={form.coverImageUrl} alt="Portada" className="w-full h-40 object-cover" />
            <button
              type="button"
              onClick={() => update("coverImageUrl", "")}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => coverInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 p-8 text-center transition-colors hover:border-[var(--color-champagne)] hover:bg-[var(--color-champagne)]/5"
          >
            {uploadingCover ? (
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-champagne)]" />
            ) : (
              <ImagePlus className="h-6 w-6 text-[var(--color-midnight)]/30" />
            )}
            <p className="text-sm font-semibold text-[var(--color-midnight)]/50">
              {uploadingCover ? "Subiendo..." : "Subir foto de portada"}
            </p>
            <p className="text-xs text-[var(--color-midnight)]/30">JPG, PNG o WebP · máx. 5 MB</p>
          </div>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverUpload}
          className="hidden"
        />
      </div>

      {/* ── Música (solo LUXURY) ── */}
      {isLuxury && (
        <div className="rounded-2xl border border-[var(--color-champagne)]/40 bg-[var(--color-champagne)]/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-[var(--color-champagne)]" />
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-champagne)]">
              Música — Incluida en tu plan Premium
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/60 mb-1.5">
              Link de playlist de Spotify (opcional)
            </label>
            <input
              type="url"
              value={form.typeFields.spotifyUrl ?? ""}
              onChange={(e) => updateTypeField("spotifyUrl", e.target.value)}
              placeholder="https://open.spotify.com/playlist/..."
              className={inputCls}
            />
            <p className="mt-1.5 text-xs text-[var(--color-midnight)]/40">
              Comparte la playlist que quieres que suene en tu invitación. Si no tienes, nosotros elegimos una por ti.
            </p>
          </div>
        </div>
      )}

      {/* ── Notas libres ── */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/60 mb-1.5">
          Notas adicionales
        </label>
        <textarea
          value={form.intakeNotes}
          onChange={(e) => update("intakeNotes", e.target.value)}
          rows={4}
          placeholder="Cuéntanos más: historia, tema, preferencias especiales, mesa de regalos, confirmaciones, etc."
          className={`${inputCls} resize-none`}
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-[var(--color-midnight)] py-4 text-sm font-bold uppercase tracking-widest text-[var(--color-cream)] hover:bg-[var(--color-midnight)]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Enviar mis datos al equipo →"
        )}
      </button>
    </form>
  );
}
