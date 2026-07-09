import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";

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
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {session.user.name ?? "Admin"}
        </p>
        <h1 className="mt-1 font-heading text-4xl uppercase tracking-tight">
          Panel admin
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside>
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
