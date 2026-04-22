import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  // Defensa en profundidad: además del middleware, redirigir si no hay sesión
  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Momentum
          </h1>
          <div className="flex items-center gap-4">
            {/* Info del usuario */}
            <div className="flex items-center gap-3">
              {user.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.image}
                  alt={user.name ?? "Avatar"}
                  width={36}
                  height={36}
                  className="rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                  {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Botón Cerrar sesión */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                id="signout-button"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            ¡Bienvenido, {user.name?.split(" ")[0] ?? "usuario"}!
          </h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Tu panel de control está listo. Pronto podrás crear tus invitaciones
            aquí.
          </p>
        </div>
      </main>
    </div>
  );
}
