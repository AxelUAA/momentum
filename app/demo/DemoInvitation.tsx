"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AuroraTemplate } from "@/components/templates/Aurora";

/* ─── Mock Data ─────────────────────────────────────────── */

const DEMO_EVENT = {
  id: "demo-event",
  userId: "demo-user",
  templateId: "demo-template",
  type: "WEDDING" as const,
  title: "Sofía & Alejandro",
  slug: "demo-sofia-alejandro",
  eventDate: new Date("2026-11-15T17:00:00"),
  timezone: "America/Mexico_City",
  locationName: "Hacienda San Gabriel de las Palmas",
  locationAddress: "Km 41.8 Carr. Federal Cuernavaca-Chilpancingo, Morelos",
  locationLat: 18.8185,
  locationLng: -99.2588,
  locationUrl: null,
  privacyMode: "UNIQUE_LINK" as const,
  accessCode: null,
  status: "ACTIVE" as const,
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  location: "Morelos, México",
  coverImage: null,
  tier: "COMPLETE" as const,
  paymentStatus: "PAID" as const,
  stripeCheckoutId: null,
  stripePaymentIntentId: null,
  paidAt: new Date(),
  activeUntil: new Date("2027-02-15"),
  subscriptionId: null,
  clientToken: null,
  clientName: null,
  clientEmail: null,
  intakeNotes: null,
  activeSections: {
    welcomeEnvelope: true,
    hero: true,
    story: true,
    ceremony: true,
    reception: true,
    dressCode: true,
    gallery: true,
    weather: false,
    rsvp: false,         // RSVP deshabilitado en demo
    giftRegistry: false, // Gift registry deshabilitado en demo
  },
  settings: {
    coverImage: null,
    musicUrl: null,
    story:
      "Nos conocimos una tarde lluviosa en un café de la Condesa. Desde ese momento supimos que este era el comienzo de algo increíble.",
    timeline: [
      {
        year: "2021",
        title: "Nos conocimos",
        desc: "Una tarde lluviosa en un café de la Condesa cambió nuestras vidas para siempre.",
      },
      {
        year: "2023",
        title: "Primer viaje juntos",
        desc: "Recorrimos la costa de Oaxaca, descubriendo playas escondidas y atardeceres inolvidables.",
      },
      {
        year: "2025",
        title: "La propuesta",
        desc: "En la terraza de un pequeño restaurante en San Miguel de Allende, con las luces de la ciudad como testigo.",
      },
      {
        year: "2026",
        title: "¡Nos casamos!",
        desc: "Celebraremos nuestro amor rodeados de las personas que más queremos.",
      },
    ],
    dressCode: {
      name: "Formal / Black Tie Opcional",
      description:
        "Caballeros: traje oscuro o smoking. Damas: vestido largo o cocktail elegante. Colores sugeridos: champagne, negro, verde esmeralda.",
      images: [],
    },
    gallery: [],
    ceremony: {
      time: "17:00 hrs",
      name: "Capilla de la Hacienda",
      address: "Hacienda San Gabriel de las Palmas, Morelos",
      mapsUrl: "https://maps.google.com/?q=18.8185,-99.2588",
    },
    reception: {
      time: "19:30 hrs",
      name: "Jardín Principal",
      address: "Hacienda San Gabriel de las Palmas, Morelos",
      mapsUrl: "https://maps.google.com/?q=18.8185,-99.2588",
    },
    rsvpDeadline: "2026-10-15",
    colors: {
      primary: "#0F1B2D",
      accent: "#D4AF7A",
      secondary: "#C9A8A0",
    },
    giftRegistry: {},
  },
  template: {
    id: "demo-template",
    name: "Aurora",
    slug: "aurora",
    type: "WEDDING" as const,
    description: "Template premium para bodas",
    previewImageUrl: null,
    config: {},
    isPremium: true,
    isActive: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  user: {
    id: "demo-user",
    name: "Momentum Demo",
    email: "demo@momentuminvites.com",
    emailVerified: null,
    image: null,
    phone: null,
    plan: "FREE" as const,
    billingName: null,
    billingRfc: null,
    billingEmail: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "USER" as const,
    onboardingCompleted: true,
    stripeCustomerId: null,
  },
};

const DEMO_GUEST = {
  id: "demo-guest",
  eventId: "demo-event",
  name: "Invitado Especial",
  email: null,
  phone: null,
  uniqueToken: "demo-token",
  allowedGuests: 2,
  invitedBy: null,
  relationship: null,
  tableNumber: null,
  adminNotes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  rsvp: null,
};

export function DemoInvitation() {
  return (
    <div className="relative">
      {/* Banner superior demo */}
      <div className="sticky top-0 z-[100] flex items-center justify-center gap-2 bg-gradient-to-r from-[#0F1B2D] via-[#1B3A5C] to-[#0F1B2D] px-4 py-3 text-center text-sm text-white shadow-lg">
        <Sparkles className="h-4 w-4 text-[var(--color-champagne)]" />
        <span>
          Esta es una <strong className="text-[var(--color-champagne)]">demo</strong> — 
        </span>
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-1 font-semibold text-[var(--color-champagne)] underline decoration-[var(--color-champagne)]/30 underline-offset-2 transition-colors hover:text-white"
        >
          Crea tu propia invitación
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Template Aurora con datos mock */}
      <AuroraTemplate event={DEMO_EVENT as any} guest={DEMO_GUEST as any} />
    </div>
  );
}
