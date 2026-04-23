"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import {
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  Settings,
} from "lucide-react";
import { UserMenu } from "./UserMenu";

const navItems = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Eventos", href: "/dashboard/events", icon: Calendar },
  { name: "Invitados", href: "/dashboard/guests", icon: Users },
  { name: "Ventas", href: "/dashboard/sales", icon: CreditCard },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[260px] flex-col bg-[var(--color-midnight)] text-[var(--color-cream)]">
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <Link href="/dashboard" className="transition-opacity hover:opacity-80">
          <Logo variant="onDark" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-[var(--color-champagne)]/10 text-[var(--color-champagne)] border-l-2 border-[var(--color-champagne)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <UserMenu user={user} />
      </div>
    </div>
  );
}
