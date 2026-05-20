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
  Receipt,
  Settings,
  X,
  ExternalLink,
  ListChecks,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { UserMenu } from "./UserMenu";

// ── Nav items por tier ──────────────────────────────────────────────────────

const adminNavItems = [
  { name: "Ver Landing",   href: "/",                   icon: ExternalLink },
  { name: "Inicio",        href: "/dashboard",          icon: LayoutDashboard },
  { name: "Eventos",       href: "/dashboard/events",   icon: Calendar },
  { name: "Invitados",     href: "/dashboard/guests",   icon: Users },
  { name: "Ventas",        href: "/dashboard/sales",    icon: CreditCard },
  { name: "Facturación",   href: "/dashboard/billing",  icon: Receipt },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

const adminOnlyItems = [
  { name: "Operaciones", href: "/dashboard/admin/operations", icon: ListChecks },
  { name: "Super Admin", href: "/dashboard/admin",            icon: ShieldCheck },
];

// Suscriptor: puede crear y gestionar sus propios eventos autónomamente
const subscriberNavItems = [
  { name: "Ver Landing",   href: "/",                   icon: ExternalLink },
  { name: "Inicio",        href: "/dashboard",          icon: LayoutDashboard },
  { name: "Mis Eventos",   href: "/dashboard/events",   icon: Calendar },
  { name: "Invitados",     href: "/dashboard/guests",   icon: Users },
  { name: "Facturación",   href: "/dashboard/billing",  icon: Receipt },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

// Cliente básico: solo ve sus invitaciones (gestionadas por admin)
const clientNavItems = [
  { name: "Ver Landing",      href: "/",                   icon: ExternalLink },
  { name: "Mis invitaciones", href: "/dashboard",          icon: Calendar },
  { name: "Invitados",        href: "/dashboard/guests",   icon: Users },
  { name: "Configuración",    href: "/dashboard/settings", icon: Settings },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_LABEL: Record<string, string> = {
  ORGANIZADOR_PLUS: "Organizador Plus",
  ORGANIZADOR_PRO:  "Organizador Pro",
};

// ── Component ────────────────────────────────────────────────────────────────

export function Sidebar({
  user,
  subscription,
  onClose,
}: {
  user: any;
  subscription?: any;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN";
  const isSubscriber = !isAdmin && !!subscription;

  const navItems = isAdmin
    ? adminNavItems
    : isSubscriber
    ? subscriberNavItems
    : clientNavItems;

  return (
    <div className="flex h-full w-[260px] flex-col bg-[var(--color-midnight)] text-[var(--color-cream)]">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
        <Link href="/dashboard" className="transition-opacity hover:opacity-80">
          <Logo variant="onDark" />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-white/70" />
          </button>
        )}
      </div>

      {/* Plan badge for subscribers */}
      {isSubscriber && subscription?.plan && (
        <div className="mx-3 mt-4 flex items-center gap-2 rounded-xl bg-[var(--color-brand)]/10 px-3 py-2">
          <Zap className="h-3.5 w-3.5 shrink-0 text-[var(--color-brand)]" />
          <span className="text-[11px] font-bold text-[var(--color-brand)] truncate">
            {PLAN_LABEL[subscription.plan] ?? subscription.plan}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
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
              <Icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}

        {/* Sección admin — solo visible para ADMIN */}
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-white/10 space-y-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
              Admin
            </p>
            {adminOnlyItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
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
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User menu */}
      <div className="border-t border-white/10 p-3">
        <UserMenu user={user} />
      </div>
    </div>
  );
}
