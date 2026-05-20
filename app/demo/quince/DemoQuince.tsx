"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BloomTemplate } from "@/components/templates/Bloom";

const DEMO_EVENT = {
  id: "demo-quince",
  userId: "demo-user",
  templateId: "bloom-template",
  type: "XV" as const,
  title: "Los XV de Valentina",
  slug: "demo-valentina-15",
  eventDate: new Date("2026-10-15T18:00:00"),
  timezone: "America/Mexico_City",
  locationName: "Hacienda San José",
  locationAddress: "Av. Principal 456, Querétaro",
  locationLat: 20.5881,
  locationLng: -100.3899,
  locationUrl: null,
  privacyMode: "UNIQUE_LINK" as const,
  accessCode: null,
  status: "ACTIVE" as const,
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  location: "Querétaro, Qro.",
  coverImage: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=2070&auto=format&fit=crop",
  tier: "COMPLETE" as const,
  paymentStatus: "PAID" as const,
  stripeCheckoutId: null,
  stripePaymentIntentId: null,
  paidAt: new Date(),
  activeUntil: new Date("2027-04-15"),
  subscriptionId: null,
  clientToken: null,
  clientName: null,
  clientEmail: null,
  intakeNotes: null,
  activeSections: {
    hero: true,
    story: true,
    misa: true,
    fiesta: true,
    court: true,
    gallery: true,
    dressCode: true,
    giftRegistry: true,
    rsvp: false,         // RSVP deshabilitado en demo
  },
  settings: {
    eventType: "XV" as const,
    coverImage: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=2070&auto=format&fit=crop",
    musicUrl: null,
    celebrantName: "Valentina",
    story: "Desde pequeña soñaba con este momento. Hoy, rodeada de mi familia y amigos, me siento la persona más feliz del mundo al celebrar mis XV años. Gracias por ser parte de mi historia y acompañarme en esta noche mágica.",
    misa: {
      time: "18:00",
      name: "Parroquia de la Sagrada Familia",
      address: "Calle Benito Juárez 123, Centro Histórico",
      mapsUrl: "https://maps.google.com/?q=20.5881,-100.3899",
    },
    fiesta: {
      time: "20:30",
      name: "Hacienda San José",
      address: "Av. Principal 456, Querétaro",
      mapsUrl: "https://maps.google.com/?q=20.5881,-100.3899",
    },
    court: [
      { name: "Sebastián M.", role: "chambelan" },
      { name: "Mateo R.", role: "chambelan" },
      { name: "Diego L.", role: "chambelan" },
      { name: "Sofía C.", role: "chambelana" },
      { name: "Camila V.", role: "chambelana" },
      { name: "Isabella G.", role: "chambelana" },
      { name: "Carlos y Ana", role: "padrino" },
    ],
    dressCode: {
      name: "Formal Elegante",
      description: "Invitamos a las damas a usar vestido largo y a los caballeros traje oscuro. Sugerimos evitar colores blancos o rosados claros.",
      images: [
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1594938298596-88ef9229f635?q=80&w=2070&auto=format&fit=crop"
      ],
    },
    gallery: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606214174585-fd10f54b1f35?q=80&w=2070&auto=format&fit=crop"
    ],
    giftRegistry: {
      digitalEnvelope: { enabled: true, suggestedAmount: 500 },
      liverpool: { enabled: true, eventCode: "12345678" }
    },
    rsvpDeadline: "2026-09-30",
    colors: {
      primary: "#DDA0DD", // Plum/Pink
      accent: "#FFB6C1", // LightPink
      secondary: "#FFDAB9", // PeachPuff
    },
  },
  template: {
    id: "bloom-template",
    name: "Bloom",
    slug: "bloom",
    type: "XV" as const,
    description: "Template elegante y romántico",
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
  eventId: "demo-quince",
  name: "Invitado de Honor",
  email: null,
  phone: null,
  uniqueToken: "demo-token",
  allowedGuests: 3,
  invitedBy: null,
  relationship: null,
  tableNumber: null,
  adminNotes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  rsvp: null,
};

export function DemoQuince() {
  return (
    <div className="relative">
      {/* Banner superior demo */}
      <div className="sticky top-0 z-[100] flex items-center justify-center gap-2 bg-[#DDA0DD] px-4 py-3 text-center text-sm text-white shadow-lg">
        <Sparkles className="h-4 w-4 text-white" />
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

      {/* Template Bloom con datos mock */}
      <BloomTemplate event={DEMO_EVENT as any} guest={DEMO_GUEST as any} />
    </div>
  );
}
