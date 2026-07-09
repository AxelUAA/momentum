import type { Metadata } from "next";
import { Anton, Epilogue } from "next/font/google";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import { CartProvider } from "@/components/store/cart-context";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { CartSheet } from "@/components/store/CartSheet";
import { AgeGate } from "@/components/store/AgeGate";
import { BRAND } from "@/lib/brand";
import "./globals.css";

/* ─── Fonts ─────────────────────────────────────────────── */

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* ─── Metadata ──────────────────────────────────────────── */

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description:
    "Catálogo premium de vapes desechables y pods recargables. ELFBAR, Lost Mary, Geek Bar y más. Pide por WhatsApp. Solo mayores de 18 años.",
  keywords: [
    "vapes",
    "vapeadores",
    "desechables",
    "pods",
    "ELFBAR",
    "Lost Mary",
    "Geek Bar",
    BRAND.name,
  ],
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description:
      "Catálogo premium de vapes desechables y pods recargables. Pide por WhatsApp.",
    url: BRAND.domain,
    siteName: BRAND.name,
    locale: "es_MX",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ─── Layout ────────────────────────────────────────────── */

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="es"
      className={`${anton.variable} ${epilogue.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Navbar
            isLoggedIn={!!session}
            isAdmin={session?.user?.role === "ADMIN"}
          />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartSheet />
          <AgeGate />
          <Toaster richColors position="top-right" theme="dark" />
        </CartProvider>
      </body>
    </html>
  );
}
