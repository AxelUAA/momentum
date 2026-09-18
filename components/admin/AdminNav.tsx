"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Package,
  PackagePlus,
  Receipt,
  ShoppingBag,
  Store,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/ventas", label: "Ventas", icon: Banknote, exact: false },
  { href: "/admin/compras", label: "Compras", icon: PackagePlus, exact: false },
  { href: "/admin/gastos", label: "Gastos", icon: Receipt, exact: false },
  { href: "/admin/resultados", label: "Resultados", icon: BarChart3, exact: false },
  { href: "/admin/clientes", label: "Clientes", icon: Users, exact: false },
  { href: "/admin/pedidos", label: "Pedidos", icon: Package, exact: false },
  { href: "/admin/productos", label: "Productos", icon: ShoppingBag, exact: false },
  { href: "/admin/catalogo", label: "Marcas y categorías", icon: Tags, exact: false },
  { href: "/admin/guia", label: "Guía de uso", icon: BookOpen, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors duration-200",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/productos"
        className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground lg:mt-6 lg:border-t lg:border-border lg:pt-6"
      >
        <Store className="h-4 w-4" />
        Ver tienda
      </Link>
    </nav>
  );
}
