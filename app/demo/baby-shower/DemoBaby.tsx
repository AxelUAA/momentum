"use client";

import Link from "next/link";
import { ArrowRight, Cloud } from "lucide-react";
import { NubeTemplate } from "@/components/templates/Nube";

const DEMO_EVENT = {
  id: "demo-baby-shower",
  userId: "demo-user",
  templateId: "nube-template",
  type: "BABY_SHOWER" as const,
  title: "Baby Shower Mateo",
  slug: "demo-baby-mateo",
  eventDate: new Date("2026-11-20T10:00:00"),
  timezone: "America/Mexico_City",
  locationName: "Jardín Botánico",
  locationAddress: "Av. Las Flores 123, CDMX",
  locationLat: 19.4326,
  locationLng: -99.1332,
  locationUrl: null,
  privacyMode: "UNIQUE_LINK" as const,
  accessCode: null,
  status: "ACTIVE" as const,
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  location: "CDMX, México",
  coverImage: "https://images.unsplash.com/photo-1555252834-0346399b90c3?q=80&w=2070&auto=format&fit=crop",
  tier: "COMPLETE" as const,
  paymentStatus: "PAID" as const,
  stripeCheckoutId: null,
  stripePaymentIntentId: null,
  paidAt: new Date(),
  activeUntil: new Date("2027-05-20"),
  subscriptionId: null,
  clientToken: null,
  clientName: null,
  clientEmail: null,
  intakeNotes: null,
  activeSections: {
    hero: true,
    parents: true,
    theme: true,
    venue: true,
    gallery: true,
    wishList: true,
    rsvp: false,         // RSVP deshabilitado en demo
  },
  settings: {
    eventType: "BABY_SHOWER" as const,
    coverImage: "https://images.unsplash.com/photo-1555252834-0346399b90c3?q=80&w=2070&auto=format&fit=crop",
    musicUrl: null,
    parentNames: { mom: "Sofía", dad: "Carlos" },
    babyName: "Mateo",
    dueDate: "2026-12-25",
    theme: "Ositos y Nubes",
    venue: {
      time: "10:00",
      name: "Jardín de Fiestas Las Jacarandas",
      address: "Calle de la Primavera 15, Coyoacán, CDMX",
      mapsUrl: "https://maps.google.com/?q=19.35, -99.16",
    },
    wishList: [
      { name: "Carriola Doona", priority: "alta", url: "https://amazon.com" },
      { name: "Esterilizador de Biberones", priority: "alta" },
      { name: "Ropita de 3 a 6 meses", priority: "media" },
      { name: "Pañales etapa 1", priority: "media" },
      { name: "Monitor de video", priority: "baja" },
    ],
    dressCode: {
      name: "Tonos pastel o azul bebé",
      description: "¡Ven cómodo y acompáñanos a celebrar usando los colores del tema!",
      images: [],
    },
    gallery: [
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522771930-78848d528718?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473621038790-b778b4750239?q=80&w=2070&auto=format&fit=crop",
    ],
    rsvpDeadline: "2026-11-10",
    colors: {
      primary: "#A2C4C9", // Soft Baby Blue/Mint
      accent: "#F2D7D5", // Soft pink
      secondary: "#FCF3CF", // Soft yellow
    },
  },
  template: {
    id: "nube-template",
    name: "Nube",
    slug: "nube",
    type: "BABY_SHOWER" as const,
    description: "Template tierno y moderno para Baby Showers",
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
  eventId: "demo-baby-shower",
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

export function DemoBaby() {
  return (
    <div className="relative">
      {/* Banner superior demo */}
      <div className="sticky top-0 z-[100] flex items-center justify-center gap-2 bg-[#A2C4C9] px-4 py-3 text-center text-sm text-white shadow-lg">
        <Cloud className="h-4 w-4 text-white" />
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

      {/* Template Nube con datos mock */}
      <NubeTemplate event={DEMO_EVENT as any} guest={DEMO_GUEST as any} />
    </div>
  );
}
