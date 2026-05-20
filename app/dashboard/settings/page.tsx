import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { User, Bell, ExternalLink, Star } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Configuración | Momentum",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  // Obtener el evento más reciente del cliente (para el portal link)
  const latestEvent = await prisma.event.findFirst({
    where: { userId: user.id, paymentStatus: "PAID" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, slug: true, clientToken: true,
      tier: true, status: true, activeUntil: true, paidAt: true,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://momentum-alpha-six.vercel.app";

  // Server action para actualizar nombre
  async function updateName(formData: FormData) {
    "use server";
    const name = (formData.get("name") as string)?.trim();
    if (!name || name.length < 2) return;
    await prisma.user.update({
      where: { id: session!.user!.id },
      data: { name },
    });
    revalidatePath("/dashboard/settings");
  }

  const tierLabel = latestEvent?.tier === "LUXURY" ? "Invitación Premium" : "Invitación Pro";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          Configuración
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tu perfil y datos de acceso
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ── Perfil ─────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10">
              <User className="h-5 w-5 text-[var(--color-brand)]" />
            </div>
            <h2 className="text-lg font-bold">Mi perfil</h2>
          </div>

          <form action={updateName} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Nombre
              </label>
              <input
                name="name"
                type="text"
                defaultValue={user.name ?? ""}
                placeholder="Tu nombre completo"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email
              </label>
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
                {user.email}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                El email no se puede cambiar. Es tu identificador de acceso.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex items-center rounded-xl bg-[var(--color-midnight)] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--color-cream)] hover:bg-[var(--color-midnight)]/80 transition-all active:scale-95"
            >
              Guardar nombre
            </button>
          </form>
        </div>

        {/* ── Mi plan / Invitación ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10">
              <Star className="h-5 w-5 text-[var(--color-brand)]" />
            </div>
            <h2 className="text-lg font-bold">Mi invitación</h2>
          </div>

          {latestEvent ? (
            <div className="space-y-4">
              <dl className="grid grid-cols-1 gap-3">
                <div className="rounded-xl bg-muted/40 p-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Evento
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{latestEvent.title}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Plan
                    </dt>
                    <dd className="mt-1 text-sm font-medium">{tierLabel}</dd>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </dt>
                    <dd className="mt-1 text-sm font-medium">{latestEvent.status}</dd>
                  </div>
                </div>
                {latestEvent.activeUntil && (
                  <div className="rounded-xl bg-muted/40 p-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Activa hasta
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {new Date(latestEvent.activeUntil).toLocaleDateString("es-MX", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="flex flex-col gap-2 pt-2">
                {latestEvent.clientToken && (
                  <a
                    href={`${baseUrl}/portal/${latestEvent.clientToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-all"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    Abrir mi portal
                  </a>
                )}
                <a
                  href={`/e/${latestEvent.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-all"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  Ver mi invitación
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
              <Star className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No tienes invitaciones activas
              </p>
              <Link
                href="/plantillas"
                className="mt-3 inline-flex items-center rounded-lg bg-[var(--color-midnight)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] hover:opacity-90 transition-opacity"
              >
                Comprar una invitación
              </Link>
            </div>
          )}
        </div>

        {/* ── Notificaciones ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10">
              <Bell className="h-5 w-5 text-[var(--color-brand)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Notificaciones</h2>
              <p className="text-sm text-muted-foreground">
                Recibirás actualizaciones automáticas por email en cada etapa de tu invitación.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Emails automáticos activos:</p>
            <ul className="space-y-1.5 text-sm">
              {[
                "✅ Confirmación de compra y link al portal",
                "📋 Cuando recibamos tus datos de intake",
                "🎨 Cuando empecemos a construir tu invitación",
                "👁️ Cuando tu invitación esté lista para revisar",
                "✏️ Cuando procesemos cambios solicitados",
                "🎉 Cuando tu invitación quede activa",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs">
              Los emails se envían a <span className="font-semibold text-foreground">{user.email}</span>.
              Si no los ves, revisa tu carpeta de spam.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
