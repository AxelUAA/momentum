import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = { title: "Admin | Momentum" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-32">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-4xl uppercase tracking-tight">
          Panel admin
        </h1>
        <nav className="flex gap-2">
          <Link
            href="/admin/pedidos"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            Pedidos
          </Link>
          <Link
            href="/admin/productos"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            Productos
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
