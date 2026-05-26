"use client";

import { useState, useTransition } from "react";
import { saveClientEventData, type ClientEventData, type SaveDataInput } from "@/app/actions/client-event";
import { Loader2, Save, CheckCircle2, PenLine, Clock } from "lucide-react";
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

const BIO_CONFIG: Record<string, { label: string; placeholder: string }> = {
  WEDDING:     { label: "Historia de los novios",      placeholder: "¿Cómo se conocieron? ¿Cuándo fue la propuesta? Cuéntanos su historia…" },
  XV:          { label: "Mensaje de la quinceañera",   placeholder: "Un mensaje especial, reflexión o lo que quieres compartir con tus invitados…" },
  BIRTHDAY:    { label: "Mensaje del festejado",       placeholder: "Una reflexión, agradecimiento o lo que quieras que lean tus invitados…" },
  BABY_SHOWER: { label: "Mensaje de los papás",        placeholder: "¿Cómo se sienten? ¿Algo especial que quieran compartir sobre la llegada del bebé?…" },
  BAPTISM:     { label: "Mensaje para los invitados",  placeholder: "Palabras de bienvenida o el significado de este día para tu familia…" },
  GRADUATION:  { label: "Mensaje del graduado",        placeholder: "Tu reflexión sobre este logro, agradecimientos, o lo que viene…" },
  CORPORATE:   { label: "Descripción del evento",      placeholder: "De qué trata el evento, qué se celebra o los objetivos del encuentro…" },
  DEFAULT:     { label: "Descripción",                 placeholder: "Cuéntanos más sobre tu evento y lo que quieres que sepan tus invitados…" },
};

const FUNFACTS_CONFIG: Record<string, { label: string; placeholder: string }> = {
  WEDDING:    { label: "Dato curioso de los novios",  placeholder: "Ej: Se conocieron en un viaje a Oaxaca" },
  XV:         { label: "Dato curioso",                placeholder: "Ej: Su color favorito es el azul marino" },
  BIRTHDAY:   { label: "Dato curioso",                placeholder: "Ej: Le encanta la fotografía desde los 12 años" },
  GRADUATION: { label: "Logro o dato curioso",        placeholder: "Ej: Estudió con beca completa los 5 años" },
};

const TYPES_WITH_FUNFACTS = new Set(["WEDDING", "XV", "BIRTHDAY", "GRADUATION"]);

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
  const bioConfig = BIO_CONFIG[event.type] ?? BIO_CONFIG.DEFAULT;
  const funFactsConfig = FUNFACTS_CONFIG[event.type] ?? FUNFACTS_CONFIG.WEDDING;
  const hasFunFacts = TYPES_WITH_FUNFACTS.has(event.type);
  const intakeFields = (event.settings.intake as Record<string, string> | undefined) ?? {};

  const isFree = event.tier === "FREE";
  const funFactSlots = isFree ? 1 : 5;

  const existingFunFacts = Array.isArray(event.settings.funFacts)
    ? (event.settings.funFacts as string[])
    : [];
  const initialFunFacts: string[] = Array.from({ length: funFactSlots }, (_, i) => existingFunFacts[i] ?? "");

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
  const [bio, setBio] = useState((event.settings.bio as string) ?? "");
  const [funFacts, setFunFacts] = useState<string[]>(initialFunFacts);
  const [notes, setNotes] = useState(event.intakeNotes ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
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
        bio: bio || undefined,
        funFacts: hasFunFacts ? funFacts.filter(Boolean) : undefined,
        customFields: { names },
      };

      const result = await saveClientEventData(event.id, payload);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Error al guardar");
      }
    });
  }

  // ── Panel de confirmación ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="rounded-2xl border border-[var(--color-champagne)]/30 bg-card shadow-sm overflow-hidden">
        <div className="p-10 flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-champagne)]/10">
            <CheckCircle2 className="h-8 w-8 text-[var(--color-champagne)]" />
          </div>

          <div>
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading), serif" }}
            >
              ¡Listo! Revisaremos tu invitación pronto
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
              Recibimos toda tu información. Nuestro equipo la revisará y te avisará por email cuando tu invitación esté activa.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 bg-muted/50 rounded-xl px-4 py-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Tiempo estimado: 24–48 horas
          </div>

          <button
            onClick={() => setSubmitted(false)}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-all"
          >
            <PenLine className="h-4 w-4" />
            Editar información
          </button>
        </div>
      </div>
    );
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

        {/* Sección: Biografía */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Acerca de tu evento
          </p>

          <Field label={bioConfig.label} hint="Este texto aparecerá en tu invitación. Puedes escribir lo que quieras.">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              placeholder={bioConfig.placeholder}
              className={`${inputCls} resize-none`}
              maxLength={2000}
            />
            <p className="text-[11px] text-muted-foreground/40 text-right">{bio.length}/2000</p>
          </Field>
        </div>

        {/* Sección: Datos curiosos (solo para tipos que aplica) */}
        {hasFunFacts && (
          <>
            <div className="border-t border-border" />
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {isFree ? "Dato curioso" : "5 datos curiosos"}
                </p>
                {!isFree && (
                  <p className="text-[11px] text-muted-foreground/50 mt-1">
                    Pequeños detalles que hacen única tu invitación. Deja vacíos los que no uses.
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                {funFacts.map((fact, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={fact}
                      onChange={(e) => {
                        const next = [...funFacts];
                        next[idx] = e.target.value;
                        setFunFacts(next);
                      }}
                      placeholder={funFactsConfig.placeholder}
                      maxLength={300}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sección: Notas — solo para clientes de pago */}
        {!isFree && (
          <>
            <div className="border-t border-border" />
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Notas para el equipo
              </p>
              <Field
                label="¿Algo más que debamos saber?"
                hint="Código de vestimenta, mesa de regalos, indicaciones de acceso, o cualquier detalle especial."
              >
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Cuéntanos cualquier detalle que quieras que aparezca en tu invitación…"
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>
          </>
        )}

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
