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
  user 
}: { 
  children: React.ReactNode; 
  user: any 
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#F2EDE4]">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[260px] bg-[var(--color-midnight)] text-[var(--color-cream)] fixed h-screen z-20">
        <Sidebar user={user} />
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
              <Sidebar user={user} onClose={() => setIsMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen">
        {/* Mobile header bar */}
        <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(true)} 
              className="p-2 -ml-2 rounded-xl hover:bg-black/5 active:scale-95 transition-all"
            >
              <Menu className="w-6 h-6 text-[var(--color-midnight)]" />
            </button>
            <Link href="/dashboard">
              <Logo variant="onLight" className="h-6" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/5 text-xs font-bold text-[var(--color-midnight)]/60 hover:bg-black/5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver Landing
            </Link>
            <button className="p-2 rounded-xl hover:bg-black/5 relative">
               <Bell className="w-5 h-5 text-[var(--color-midnight)]" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-brand)] rounded-full border-2 border-white" />
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
