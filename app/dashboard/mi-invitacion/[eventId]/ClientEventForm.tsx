"use client";

import { useState, useTransition } from "react";
import { saveClientEventData, type ClientEventData, type SaveDataInput } from "@/app/actions/client-event";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

// ─── Type-specific labels ─────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; placeholder: string; hint: string }> = {
  WEDDING:    { label: "Nombres de los novios",        placeholder: "Ej: María y Juan García",      hint: "Como aparecerán en la invitación" },
  XV:         { label: "Nombre de la quinceañera",     placeholder: "Ej: Sofía González",           hint: "Solo el nombre, sin título" },
  BIRTHDAY:   { label: "¿Quién cumple años?",          placeholder: "Ej: Carlos — 30 años",         hint: "Nombre y edad si quieres incluirla" },
  BABY_SHOWER:{ label: "Nombre de la mamá",            placeholder: "Ej: Valentina Reyes",          hint: "Y si ya saben el nombre del bebé, agrégalo" },
  BAPTISM:    { label: "Nombre del bebé",              placeholder: "Ej: Emilio García",            hint: "Como aparecerá en la invitación" },
  GRADUATION: { label: "Nombre del graduado",          placeholder: "Ej: Andrea López — Medicina",  hint: "Nombre y carrera o logro" },
  CORPORATE:  { label: "Nombre del evento / empresa",  placeholder: "Ej: Gala Anual Acme Corp",     hint: "Nombre completo del evento" },
  DEFAULT:    { label: "Nombre del evento",            placeholder: "Ej: Fiesta de fin de año",     hint: "Como aparecerá en tu invitación" },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.DEFAULT;
}

// ─── Input component ──────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/60">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-[var(--color-champagne)] focus:outline-none focus:ring-2 focus:ring-[var(--color-champagne)]/20 transition-all";

// ─── Main form ────────────────────────────────────────────────────────────────

export function ClientEventForm({ event }: { event: ClientEventData }) {
  const typeConfig = getTypeConfig(event.type);
  const intakeFields = (event.settings.intake as Record<string, string> | undefined) ?? {};

  const [clientName, setClientName] = useState(event.clientName ?? "");
  const [clientEmail, setClientEmail] = useState(event.clientEmail ?? "");
  const [title, setTitle] = useState(event.title);
  const [names, setNames] = useState(intakeFields.names ?? "");
  const [eventDate, setEventDate] = useState(
    event.eventDate ? format(new Date(event.eventDate), "yyyy-MM-dd") : "",
  );
  const [eventTime, setEventTime] = useState(
    event.eventDate ? format(new Date(event.eventDate), "HH:mm") : "",
  );
  const [locationName, setLocationName] = useState(event.locationName ?? "");
  const [locationAddress, setLocationAddress] = useState(event.locationAddress ?? "");
  const [notes, setNotes] = useState(event.intakeNotes ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const payload: SaveDataInput = {
        title: title || typeConfig.placeholder,
        clientName: clientName || undefined,
        clientEmail: clientEmail || undefined,
        eventDate: eventDate || undefined,
        eventTime: eventTime || undefined,
        locationName: locationName || undefined,
        locationAddress: locationAddress || undefined,
        intakeNotes: notes || undefined,
        customFields: { names },
      };

      const result = await saveClientEventData(event.id, payload);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error ?? "Error al guardar");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Datos de tu evento</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Esta información se usará para armar tu invitación.
          </p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Guardado
          </span>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* Sección: Tus datos de contacto */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Tus datos de contacto
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Tu nombre completo" hint="Como quieres que aparezca en tu invitación">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: María González"
                className={inputCls}
              />
            </Field>

            <Field label="Tu email de contacto" hint="Para que podamos enviarte actualizaciones">
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="hola@ejemplo.com"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Sección: ¿Quiénes celebran? */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            ¿Quiénes celebran?
          </p>

          <Field label={typeConfig.label} hint={typeConfig.hint}>
            <input
              type="text"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder={typeConfig.placeholder}
              className={inputCls}
            />
          </Field>

          <Field label="Nombre del evento" hint="Cómo aparecerá el título en la invitación">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Ej: Boda de ${typeConfig.placeholder.split("Ej: ")[1] ?? "..."}`}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Sección: Fecha y lugar */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            ¿Cuándo y dónde?
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Fecha del evento">
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Hora">
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Nombre del lugar" hint="Nombre del salón, casa, jardín…">
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Ej: Salón Jardines del Sol"
              className={inputCls}
            />
          </Field>

          <Field label="Dirección" hint="Escribe la dirección completa o pega un link de Google Maps">
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="Ej: Av. Constitución 450, Monterrey, NL"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Sección: Detalles extras */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Detalles adicionales
          </p>

          <Field
            label="Notas especiales"
            hint="Código de vestimenta, mesa de regalos, indicaciones de acceso, o cualquier cosa que quieras incluir."
          >
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Cuéntanos cualquier detalle especial que quieras que aparezca en tu invitación…"
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Footer / save */}
      <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Puedes guardar y editar en cualquier momento hasta que tu invitación esté activa.
        </p>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-5 py-2.5 text-sm font-bold text-[var(--color-cream)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar datos
            </>
          )}
        </button>
      </div>
    </div>
  );
}
