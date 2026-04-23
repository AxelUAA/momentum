import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileDrawer } from "@/components/dashboard/MobileDrawer";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Momentum",
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

  return (
    <div className="flex h-screen w-full bg-[#F2EDE4] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar user={session.user} />
      </div>

      {/* Mobile Header & Main Content Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden shrink-0">
          <Link href="/dashboard">
            <Logo variant="onLight" className="h-6" />
          </Link>
          <MobileDrawer user={session.user} />
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
