import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { FreeInviteForm } from "./FreeInviteForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Crear invitación gratis | Momentum",
};

export default async function NuevaGratisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard/nueva-gratis");

  // Check if user already has a free invitation
  const existing = await prisma.event.findFirst({
    where: { userId: session.user.id, tier: "FREE" },
    select: { id: true },
  });

  if (existing) {
    redirect(`/dashboard/mi-invitacion/${existing.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Mi dashboard
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-[var(--color-champagne)]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-champagne)]">
            Invitación gratuita
          </span>
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          Crea tu invitación gratis
        </h1>
        <p className="mt-2 text-muted-foreground">
          Llena los datos básicos y nuestro equipo la revisará. Una vez activa, podrás compartirla con tus invitados.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8">
        <FreeInviteForm />
      </div>

      {/* Upgrade nudge */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ¿Quieres más funciones?{" "}
          <Link href="/plantillas" className="font-semibold text-foreground underline underline-offset-2 hover:opacity-80">
            Ver invitaciones de pago
          </Link>
        </p>
      </div>
    </div>
  );
}
