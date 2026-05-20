import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Momentum",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const subscription = session.user.id
    ? await prisma.subscription.findFirst({
        where: { userId: session.user.id, status: "ACTIVE" },
        select: { id: true, plan: true, status: true, currentPeriodEnd: true },
      })
    : null;

  return (
    <DashboardShell user={session.user} subscription={subscription}>
      {children}
    </DashboardShell>
  );
}
