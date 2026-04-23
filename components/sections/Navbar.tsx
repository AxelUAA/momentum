"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { name: "Plantillas", href: "#templates" },
  { name: "Precios", href: "#pricing" },
  { name: "Cómo funciona", href: "#how-it-works" },
  { name: "FAQ", href: "#faq" },
];

export function Navbar({ session }: { session?: any }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 py-3 backdrop-blur-xl"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="inline-block" aria-label="Momentum Home">
          <Logo variant="onLight" className="dark:hidden" />
          <Logo variant="mono-light" className="hidden dark:flex" />
        </Link>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          {session ? (
            <button
              onClick={() => signOut()}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "text-muted-foreground"
              )}
            >
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost" }), "text-[var(--color-midnight)] dark:text-[var(--color-cream)]")}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants(),
                  "shimmer border-none text-[var(--color-midnight)]"
                )}
              >
                Empezar gratis
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="p-2 text-foreground transition-transform hover:scale-105 active:scale-95">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/50 backdrop-blur-sm shadow-sm">
                <Menu className="h-5 w-5" strokeWidth={2} />
              </div>
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-l border-border/50 bg-background/80 backdrop-blur-3xl px-6 py-8 sm:w-[400px]">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              
              {/* Background Glow Effect */}
              <div className="pointer-events-none absolute -right-20 top-0 -z-10 h-[300px] w-[300px] rounded-full bg-[var(--color-brand)] opacity-20 blur-[100px]" />
              
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border/30 pb-6">
                  <Link
                    href="/"
                    className="inline-block"
                    onClick={() => setOpen(false)}
                    aria-label="Momentum Home"
                  >
                    <Logo variant="onLight" className="dark:hidden" />
                    <Logo variant="mono-light" className="hidden dark:flex" />
                  </Link>
                </div>
                
                <div className="flex-1 overflow-y-auto py-8">
                  <nav className="flex flex-col gap-2">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="group flex items-center justify-between rounded-2xl p-4 text-xl font-medium text-muted-foreground transition-all duration-300 hover:bg-foreground/5 hover:text-foreground"
                        onClick={() => setOpen(false)}
                      >
                        <span>{link.name}</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border/50 transition-all duration-300 group-hover:bg-foreground group-hover:text-background">
                          <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                        </div>
                      </Link>
                    ))}
                  </nav>
                </div>
                
                <div className="mt-auto flex flex-col gap-6 border-t border-border/30 pt-8">
                  <div className="flex items-center justify-between rounded-2xl bg-foreground/5 p-4">
                    <span className="text-sm font-medium text-foreground">Apariencia</span>
                    <ThemeToggle />
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {session ? (
                      <button
                        onClick={() => {
                          setOpen(false);
                          signOut();
                        }}
                        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full rounded-xl border-border/50 text-muted-foreground")}
                      >
                        Cerrar sesión
                      </button>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full rounded-xl border-border/50 shadow-sm")}
                          onClick={() => setOpen(false)}
                        >
                          Iniciar sesión
                        </Link>
                        <Link
                          href="/login"
                          className={cn(buttonVariants({ size: "lg" }), "w-full rounded-xl shimmer border-none text-[var(--color-midnight)] shadow-xl shadow-[var(--color-brand)]/20")}
                          onClick={() => setOpen(false)}
                        >
                          Empezar gratis
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
