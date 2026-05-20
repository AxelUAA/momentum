"use client";
import { useState, useEffect } from "react";
import { Menu, X, Bell, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardShell({
  children,
  user,
  subscription,
}: {
  children: React.ReactNode;
  user: any;
  subscription?: any;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[260px] bg-[var(--color-midnight)] text-[var(--color-cream)] fixed h-screen z-20">
        <Sidebar user={user} subscription={subscription} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 w-[260px] h-screen bg-[var(--color-midnight)] text-[var(--color-cream)] z-[101] shadow-2xl overflow-y-auto"
            >
              <Sidebar user={user} subscription={subscription} onClose={() => setIsMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen">
        {/* Mobile header bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(true)} 
              className="-ml-2 rounded-xl p-2 transition-all hover:bg-muted/60 active:scale-95"
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>
            <Link href="/dashboard">
              <Logo variant="onLight" className="h-6" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="hidden items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground transition-all hover:bg-muted/60 sm:flex"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver Landing
            </Link>
            <button className="relative rounded-xl p-2 hover:bg-muted/60">
               <Bell className="h-5 w-5 text-foreground" />
               <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-brand)] border-2 border-background" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Optional Mobile Bottom Nav (Phase 3?) */}
      </div>
    </div>
  );
}
