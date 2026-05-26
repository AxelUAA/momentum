import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft, Eye, CheckCircle2, Clock, Users,
  Image as ImageIcon, Lock, Sparkles, Star, TrendingUp,
  CreditCard, ClipboardList, Palette, PenLine,
  Heart, Crown, Cake, Baby, Droplets, GraduationCap, Building2, PartyPopper,
  type LucideIcon,
} from "lucide-react";
import { getClientEventData } from "@/app/actions/client-event";
import { getTierFeatures } from "@/lib/event-sections-map";
import { ClientEventForm } from "./ClientEventForm";
import { ClientImageSection } from "./ClientImageSection";
import { ClientGuestSection } from "./ClientGuestSection";
import { ChangeRequestForm } from "./ChangeRequestForm";

export const dynamic = "force-dynamic";

// ─── Status config ────────────────────────────────────────────────────────────

const STEPS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "PAID",              label: "Pago confirmado", Icon: CreditCard },
  { key: "INTAKE_COMPLETE",   label: "Datos enviados",  Icon: ClipboardList },
  { key: "BUILDING",          label: "Construyendo",    Icon: Palette },
  { key: "REVIEW",            label: "En revisión",     Icon: Eye },
  { key: "CHANGES_REQUESTED", label: "Ajustes",         Icon: PenLine },
  { key: "ACTIVE",            label: "Activa",          Icon: CheckCircle2 },
];

const FREE_STEPS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "DRAFT",  label: "Datos enviados", Icon: ClipboardList },
  { key: "ACTIVE", label: "Activa",         Icon: CheckCircle2 },
];

const STATUS_ORDER = ["PAID","DRAFT","INTAKE_COMPLETE","BUILDING","REVIEW","CHANGES_REQUESTED","ACTIVE","COMPLETED"];

const STATUS_MESSAGES: Record<string, { title: string; desc: string; color: string }> = {
  DRAFT:             { title: "Listo — revisaremos tu invitación pronto",   desc: "Nuestro equipo la revisará y te avisará cuando esté activa.",               color: "blue" },
  PAID:              { title: "¡Siguiente paso: completa tus datos!",        desc: "Llena el formulario de abajo para que podamos armar tu invitación.",        color: "amber" },
  INTAKE_COMPLETE:   { title: "Datos recibidos",                            desc: "Recibimos tu información. Te avisamos cuando haya un avance.",               color: "blue" },
  BUILDING:          { title: "Estamos armando tu invitación…",             desc: "Tiempo estimado: 24–48 horas. Te notificaremos por email.",                  color: "purple" },
  REVIEW:            { title: "Tu invitación está siendo revisada",         desc: "Pronto podrás verla. Si tienes cambios, escríbenos por WhatsApp.",           color: "orange" },
  CHANGES_REQUESTED: { title: "Aplicando tus cambios",                     desc: "Estamos haciendo los ajustes que pediste. Te avisamos en cuanto estén.",     color: "orange" },
  ACTIVE:            { title: "¡Tu invitación está activa!",                desc: "Ya puedes compartirla con tus invitados y ver las confirmaciones aquí.",     color: "green" },
  COMPLETED:         { title: "Evento completado",                          desc: "Tu evento ha terminado. El historial y los datos siguen disponibles.",        color: "gray" },
};

const TYPE_ICON: Record<string, LucideIcon> = {
  WEDDING:     Heart,
  XV:          Crown,
  BIRTHDAY:    Cake,
  BABY_SHOWER: Baby,
  BAPTISM:     Droplets,
  GRADUATION:  GraduationCap,
  CORPORATE:   Building2,
  CASUAL:      PartyPopper,
  OTHER:       Star,
};

const TIER_LABEL: Record<string, string> = {
  FREE:"Invitación Gratis",EXPRESS:"Express",ESSENTIAL:"Esencial",COMPLETE:"Completa",LUXURY:"Premium",
};

// ─── Progress tracker ─────────────────────────────────────────────────────────

function ProgressTracker({ status, isFree }: { status: string; isFree: boolean }) {
  const steps = isFree ? FREE_STEPS : STEPS;
  const currentIdx = Math.max(
    0,
    steps.findIndex((s) => s.key === status),
  );

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5">
        Estado de tu invitación
      </p>
      <div className="relative flex items-start">
        {/* Track line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-border hidden sm:block" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-[var(--color-champagne)] hidden sm:block transition-all duration-700"
          style={{ width: `${Math.min(100, (currentIdx / Math.max(1, steps.length - 1)) * 100)}%` }}
        />

        <div className={`grid gap-3 relative z-10 w-full`} style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
          {steps.map((step, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            const StepIcon = step.Icon;
            return (
              <div key={step.key} className="flex flex-col items-center text-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? "bg-[var(--color-champagne)]/20 border-[var(--color-champagne)]"
                      : active
                      ? "bg-[var(--color-midnight)] border-[var(--color-midnight)]"
                      : "bg-card border-border"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-champagne)]" />
                  ) : (
                    <StepIcon className={`h-4 w-4 ${active ? "text-[var(--color-cream)]" : "text-muted-foreground opacity-30"}`} />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium leading-tight ${
                    active ? "text-foreground font-bold" : done ? "text-muted-foreground" : "text-muted-foreground/40"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status message */}
      {STATUS_MESSAGES[status] && (
        <div className={`mt-5 rounded-xl p-4 text-sm border ${
          STATUS_MESSAGES[status].color === "green"  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900" :
          STATUS_MESSAGES[status].color === "amber"  ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900" :
          STATUS_MESSAGES[status].color === "purple" ? "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900" :
          STATUS_MESSAGES[status].color === "orange" ? "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900" :
          "bg-muted border-border"
        }`}>
          <p className="font-semibold">{STATUS_MESSAGES[status].title}</p>
          <p className="mt-0.5 opacity-70">{STATUS_MESSAGES[status].desc}</p>
        </div>
      )}
    </div>
  );
}

// ─── RSVP Stats (only when active) ───────────────────────────────────────────

function RsvpStats({ stats }: { stats: { total: number; confirmed: number; declined: number; pending: number } }) {
  if (stats.total === 0) return null;
  const answered = stats.confirmed + stats.declined;
  const pct = stats.total > 0 ? Math.round((answered / stats.total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Users className="h-4 w-4 text-[var(--color-champagne)]" />
        <h2 className="text-sm font-bold">Confirmaciones</h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{stats.confirmed}</p>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 mt-1">Confirmados</p>
        </div>
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-center">
          <p className="text-3xl font-black text-red-600 dark:text-red-400">{stats.declined}</p>
          <p className="text-xs font-semibold text-red-500 mt-1">No asisten</p>
        </div>
        <div className="rounded-xl bg-muted p-4 text-center">
          <p className="text-3xl font-black text-muted-foreground">{stats.pending}</p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">Sin respuesta</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Respuestas recibidas</span>
          <span>{answered} / {stats.total}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-champagne)] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Views Stats ─────────────────────────────────────────────────────────────

function ViewStats({
  stats,
}: {
  stats: { total: number; last7Days: number; uniqueGuests: number };
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-4 w-4 text-[var(--color-champagne)]" />
        <h2 className="text-sm font-bold">Vistas de la invitación</h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted p-4 text-center">
          <p className="text-3xl font-black text-foreground">{stats.total}</p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">Total de vistas</p>
        </div>
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-4 text-center">
          <p className="text-3xl font-black text-blue-700 dark:text-blue-400">{stats.last7Days}</p>
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-500 mt-1">Últimos 7 días</p>
        </div>
        <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-4 text-center">
          <p className="text-3xl font-black text-purple-700 dark:text-purple-400">{stats.uniqueGuests}</p>
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-500 mt-1">Invitados que abrieron</p>
        </div>
      </div>
    </div>
  );
}

// ─── Preview CTA ──────────────────────────────────────────────────────────────

function PreviewCTA({ slug }: { slug: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-champagne)]/40 bg-[var(--color-midnight)] p-8 text-center">
      <Sparkles className="h-10 w-10 text-[var(--color-champagne)] mx-auto mb-3" />
      <h2 className="text-xl font-bold text-[var(--color-cream)] mb-2" style={{ fontFamily: "var(--font-fraunces), serif" }}>
        Tu invitación está lista para compartir
      </h2>
      <p className="text-[var(--color-cream)]/60 text-sm mb-6">
        Ábrela, revísala y compártela con quien quieras.
      </p>
      <Link
        href={`/e/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-champagne)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[var(--color-midnight)] hover:opacity-90 transition-opacity"
      >
        <Eye className="h-4 w-4" />
        Abrir mi invitación
      </Link>
    </div>
  );
}

// ─── Locked notice ────────────────────────────────────────────────────────────

function LockedNotice({ event }: { event: { title: string; slug: string; status: string } }) {
  const isActive = event.status === "ACTIVE" || event.status === "COMPLETED";
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-bold">Datos bloqueados</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isActive
              ? "Tu invitación está activa. Para hacer cambios, escríbenos por WhatsApp o email."
              : "Los datos están en proceso de revisión y no pueden editarse en este momento."}
          </p>
          <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
            {event.title && (
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Evento</p>
                <p className="font-semibold truncate">{event.title}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ eventId: string }> };

export default async function ClientEventPage({ params }: Props) {
  const { eventId } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const event = await getClientEventData(eventId);
  if (!event) notFound();

  const isFree = event.tier === "FREE";
  const features = getTierFeatures(event.tier);
  const isActive = event.status === "ACTIVE" || event.status === "COMPLETED";
  const isEditable = !["ACTIVE", "COMPLETED", "ARCHIVED"].includes(event.status);
  // Portada: disponible siempre que sea editable (incluso DRAFT / FREE)
  // Galería: solo en tiers con galería y pasado el estado PAID
  const canManageCover = isEditable;
  const canManageGallery = features.gallery && !["DRAFT", "PAID"].includes(event.status);
  const canManageGuests = !["DRAFT", "PAID"].includes(event.status);
  const tierLabel = TIER_LABEL[event.tier] ?? event.tier;
  const EventTypeIcon = TYPE_ICON[event.type] ?? Star;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Mi dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <EventTypeIcon className="h-8 w-8 text-muted-foreground shrink-0" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-fraunces), serif" }}>
              {event.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {isFree && <Star className="h-2.5 w-2.5" />}
                {tierLabel}
              </span>
              {event.eventDate && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(event.eventDate), "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              )}
            </div>
          </div>
        </div>
        {isActive && (
          <Link
            href={`/e/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-midnight)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] hover:opacity-90 transition-opacity"
          >
            <Eye className="h-3.5 w-3.5" />
            Ver invitación
          </Link>
        )}
      </div>

      {/* Free tier banner */}
      {isFree && (
        <div className="rounded-2xl border border-[var(--color-champagne)]/30 bg-[var(--color-champagne)]/5 p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-[var(--color-champagne)] shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold">Invitación gratis</span>{" "}
            <span className="text-muted-foreground">
              — información limitada. El admin la revisará y activará si todo está completo.{" "}
              <Link href="/plantillas" className="underline font-semibold hover:opacity-80">
                Pasa a una invitación de pago
              </Link>{" "}
              para acceder a todas las funciones.
            </span>
          </div>
        </div>
      )}

      {/* Progress */}
      <ProgressTracker status={event.status} isFree={isFree} />

      {/* Data form */}
      {isEditable ? (
        <ClientEventForm event={event} />
      ) : (
        <LockedNotice event={event} />
      )}

      {/* Fotos: portada siempre disponible cuando editable; galería solo si el tier la incluye */}
      {(canManageCover || canManageGallery) && (
        <ClientImageSection
          eventId={event.id}
          initialCover={event.coverImage}
          initialGallery={event.gallery}
          isEditable={isEditable}
          showGallery={canManageGallery}
        />
      )}

      {/* Guests */}
      {canManageGuests && (
        <ClientGuestSection
          event={event}
          initialGuests={event.guests}
          isActive={isActive}
          isFree={isFree}
          maxGuests={features.maxGuests}
          whatsappGenerator={features.whatsappGenerator}
        />
      )}

      {/* RSVP stats (active only) */}
      {isActive && <RsvpStats stats={event.guestStats} />}

      {/* Views analytics (active only) */}
      {isActive && <ViewStats stats={event.viewStats} />}

      {/* Solicitar cambios — solo cuando está activa */}
      {event.status === "ACTIVE" && (
        <ChangeRequestForm eventId={event.id} />
      )}

      {/* Preview CTA */}
      {isActive && <PreviewCTA slug={event.slug} />}
    </div>
  );
}
