import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { SubscriberEventForm } from "./SubscriberEventForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nueva invitación | Momentum",
};

const PLAN_LABEL: Record<string, string> = {
  ORGANIZADOR_PLUS: "Organizador Plus",
  ORGANIZADOR_PRO: "Organizador Pro",
};

const PLAN_LIMITS: Record<string, number> = {
  ORGANIZADOR_PLUS: 5,
  ORGANIZADOR_PRO: 20,
};

export default async function NuevaSuscriptorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard/nueva-suscriptor");

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    select: {
      plan: true,
      _count: { select: { events: { where: { paymentStatus: "PAID" } } } },
    },
  });

  if (!subscription) redirect("/dashboard");

  const planLabel = PLAN_LABEL[subscription.plan] ?? subscription.plan;
  const limit = PLAN_LIMITS[subscription.plan] ?? 5;
  const used = subscription._count.events;
  const slotsLeft = limit - used;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Mi dashboard
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-[var(--color-champagne)]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-champagne)]">
            {planLabel}
          </span>
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          Nueva invitación
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tienes <strong>{slotsLeft} de {limit} slots</strong> disponibles.
          Elige el tipo de evento y la plantilla para empezar.
        </p>
      </div>

      {slotsLeft <= 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-6 text-center">
          <p className="font-bold text-amber-800 dark:text-amber-300">Sin slots disponibles</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            Alcanzaste el límite de tu plan. Archiva un evento completado para liberar un slot.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-semibold underline underline-offset-2"
          >
            Ver mis eventos
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8">
          <SubscriberEventForm planLabel={planLabel} />
        </div>
      )}
    </div>
  );
}
