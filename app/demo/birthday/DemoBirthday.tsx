"use client";

import Link from "next/link";
import { ArrowRight, PartyPopper } from "lucide-react";
import { ConfettiTemplate } from "@/components/templates/Confetti";

/* ─── Mock Data ─────────────────────────────────────────── */

const DEMO_EVENT = {
  id: "demo-birthday",
  userId: "demo-user",
  templateId: "confetti-template",
  type: "BIRTHDAY" as const,
  title: "Los 30 de María",
  slug: "demo-maria-30",
  eventDate: new Date("2026-08-20T20:00:00"),
  timezone: "America/Mexico_City",
  locationName: "Terraza Roma",
  locationAddress: "Colima 123, Roma Norte, CDMX",
  locationLat: 19.4194,
  locationLng: -99.1594,
  locationUrl: null,
  privacyMode: "UNIQUE_LINK" as const,
  accessCode: null,
  status: "ACTIVE" as const,
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  location: "CDMX, México",
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
    hero: true,
    about: true,
    venue: true,
    gallery: true,
    dressCode: true,
    wishList: true,
    rsvp: false,         // RSVP deshabilitado en demo
  },
  settings: {
    eventType: "BIRTHDAY" as const,
    coverImage: null,
    musicUrl: null,
    celebrantName: "María",
    celebrantAge: 30,
    bio: "¡Llegó a la tercera década! Celebremos juntos esta nueva etapa llena de aventuras, risas y buenas vibras. No te puedes perder esta noche tan especial.",
    funFacts: [
      "Su postre favorito es el tiramisú",
      "Colecciona discos de vinilo de los 80s",
      "Ha viajado a más de 15 países",
      "No puede vivir sin su café de la mañana",
    ],
    venue: {
      time: "20:00 hrs",
      name: "Terraza Roma",
      address: "Colima 123, Roma Norte, CDMX",
      mapsUrl: "https://maps.google.com/?q=19.4194,-99.1594",
    },
    wishList: [
      { name: "Vinilos clásicos", priority: "alta" },
      { name: "Café de especialidad", priority: "media" },
      { name: "Libros de arte", priority: "media" },
      { name: "Tarjetas de regalo Zara", priority: "baja", url: "https://zara.com" },
    ],
    dressCode: {
      name: "Cocktail Festivo",
      description: "¡Ponte algo colorido y cómodo para bailar toda la noche! Colores brillantes bienvenidos.",
      images: [],
    },
    gallery: [],
    rsvpDeadline: "2026-08-10",
    colors: {
      primary: "#FF6B6B",
      accent: "#4ECDC4",
      secondary: "#FFE66D",
    },
  },
  template: {
    id: "confetti-template",
    name: "Confetti",
    slug: "confetti",
    type: "BIRTHDAY" as const,
    description: "Template vibrante para cumpleaños",
    previewImageUrl: null,
    config: {},
    isPremium: true,
    isActive: true,
    sortOrder: 1,
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
  eventId: "demo-birthday",
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

export function DemoBirthday() {
  return (
    <div className="relative">
      {/* Banner superior demo */}
      <div className="sticky top-0 z-[100] flex items-center justify-center gap-2 bg-[#FF6B6B] px-4 py-3 text-center text-sm text-white shadow-lg">
        <PartyPopper className="h-4 w-4 text-white" />
        <span>
          Esta es una <strong>demo</strong> — 
        </span>
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-1 font-bold text-white underline decoration-white/50 underline-offset-2 transition-colors hover:text-white/90"
        >
          Crea tu propia invitación
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Template Confetti con datos mock */}
      <ConfettiTemplate event={DEMO_EVENT as any} guest={DEMO_GUEST as any} />
    </div>
  );
}
