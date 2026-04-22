"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
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
            <SheetTrigger className="p-2 text-foreground">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <div className="flex flex-col gap-8 pt-10">
                <Link
                  href="/"
                  className="inline-block"
                  onClick={() => setOpen(false)}
                  aria-label="Momentum Home"
                >
                  <Logo variant="onLight" className="dark:hidden" />
                  <Logo variant="mono-light" className="hidden dark:flex" />
                </Link>
                <nav className="flex flex-col gap-6">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col gap-4 mt-8 border-t border-border pt-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Tema</span>
                    <ThemeToggle />
                  </div>
                  {session ? (
                    <button
                      onClick={() => {
                        setOpen(false);
                        signOut();
                      }}
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full text-muted-foreground")}
                    >
                      Cerrar sesión
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
                        onClick={() => setOpen(false)}
                      >
                        Iniciar sesión
                      </Link>
                      <Link
                        href="/login"
                        className={cn(buttonVariants({ size: "lg" }), "w-full shimmer border-none text-[var(--color-midnight)]")}
                        onClick={() => setOpen(false)}
                      >
                        Empezar gratis
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
