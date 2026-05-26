import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

/* ─── Fonts ─────────────────────────────────────────────── */

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/* ─── Metadata ──────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Momentum — Invitaciones digitales premium",
  description:
    "Crea, envía y gestiona invitaciones digitales premium para bodas, XV años, bautizos y eventos en menos de 5 minutos.",
  keywords: [
    "invitaciones digitales",
    "invitaciones de boda",
    "invitaciones XV años",
    "invitaciones online México",
    "RSVP digital",
    "Momentum",
  ],
  openGraph: {
    title: "Momentum — Invitaciones digitales premium",
    description:
      "Crea, envía y gestiona invitaciones digitales premium para bodas, XV años, bautizos y eventos en menos de 5 minutos.",
    url: "https://momentum.mx",
    siteName: "Momentum",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Momentum — Invitaciones digitales premium",
    description:
      "Invitaciones digitales premium para bodas, XV años y eventos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ─── Layout ────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${playfair.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </body>
      </html>
  );
}
