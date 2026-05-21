// ─── Secciones disponibles por tipo de evento ──────────────────────────────
// spotify y guestbook se activan solo en tier LUXURY (ver TIER_FEATURES)
export const SECTIONS_BY_EVENT_TYPE = {
  WEDDING: {
    welcomeEnvelope: true, hero: true, story: true, timeline: true,
    ceremony: true, reception: true, dressCode: true, gallery: true,
    rsvp: true, giftRegistry: true, guestbook: false, spotify: false,
  },
  XV: {
    welcomeEnvelope: true, hero: true, story: true, timeline: false,
    ceremony: true, reception: true, dressCode: true, gallery: true,
    rsvp: true, giftRegistry: true, guestbook: false, spotify: false,
  },
  BIRTHDAY: {
    welcomeEnvelope: false, hero: true, story: false, timeline: false,
    ceremony: false, reception: true, dressCode: true, gallery: true,
    rsvp: true, giftRegistry: false, guestbook: false, spotify: false,
  },
  CORPORATE: {
    welcomeEnvelope: false, hero: true, story: false, timeline: true,
    ceremony: false, reception: true, dressCode: true, gallery: false,
    rsvp: true, giftRegistry: false, guestbook: false, spotify: false,
  },
  BAPTISM: {
    welcomeEnvelope: true, hero: true, story: false, timeline: false,
    ceremony: true, reception: true, dressCode: true, gallery: true,
    rsvp: true, giftRegistry: true, guestbook: false, spotify: false,
  },
  GRADUATION: {
    welcomeEnvelope: false, hero: true, story: true, timeline: true,
    ceremony: false, reception: true, dressCode: true, gallery: true,
    rsvp: true, giftRegistry: false, guestbook: false, spotify: false,
  },
  BABY_SHOWER: {
    welcomeEnvelope: false, hero: true, story: false, timeline: false,
    ceremony: false, reception: true, dressCode: true, gallery: false,
    rsvp: true, giftRegistry: true, guestbook: false, spotify: false,
  },
} as const;

// ─── Features por tier ──────────────────────────────────────────────────────
// FREE:      Gratis — RSVP + mapa + countdown, máx 30 invitados, 30 días
// EXPRESS:   $299 — + galería, máx 60 invitados, 60 días
// ESSENTIAL: $499 — + galería, máx 120 invitados, 60 días
// COMPLETE:  $1,199 — + dressCode, giftRegistry, WhatsApp, máx 250, 60 días
// LUXURY:    $999 — Todo + spotify, guestbook, invitados ilimitados, 60 días
export const TIER_FEATURES = {
  FREE: {
    rsvp: true,
    gallery: false,
    map: true,
    countdown: true,
    dressCode: false,
    giftRegistry: false,
    spotify: false,
    guestbook: false,
    whatsappGenerator: false,
    maxGuests: 30,
    activeDays: 30,
  },
  EXPRESS: {
    rsvp: true,
    gallery: true,
    map: true,
    countdown: true,
    dressCode: false,
    giftRegistry: false,
    spotify: false,
    guestbook: false,
    whatsappGenerator: false,
    maxGuests: 60,
    activeDays: 60,
  },
  ESSENTIAL: {
    rsvp: true,
    gallery: true,
    map: true,
    countdown: true,
    dressCode: false,
    giftRegistry: false,
    spotify: false,
    guestbook: false,
    whatsappGenerator: false,
    maxGuests: 120,
    activeDays: 60,
  },
  COMPLETE: {
    rsvp: true,
    gallery: true,
    map: true,
    countdown: true,
    dressCode: true,
    giftRegistry: true,
    spotify: false,
    guestbook: false,
    whatsappGenerator: true,
    maxGuests: 250,
    activeDays: 60,
  },
  LUXURY: {
    rsvp: true,
    gallery: true,
    map: true,
    countdown: true,
    dressCode: true,
    giftRegistry: true,
    spotify: true,
    guestbook: true,
    whatsappGenerator: true,
    maxGuests: null, // ilimitado
    activeDays: 60,
  },
} as const;

export type TierFeatures = typeof TIER_FEATURES[keyof typeof TIER_FEATURES];

export function getTierFeatures(tier: string): TierFeatures {
  return TIER_FEATURES[tier as keyof typeof TIER_FEATURES] ?? TIER_FEATURES.ESSENTIAL;
}

// ─── Información de tier ────────────────────────────────────────────────────
export const TIER_INFO = {
  FREE:      { price: 0,    maxGuests: 30,   label: "Gratuita", color: "gray"  },
  EXPRESS:   { price: 299,  maxGuests: 60,   label: "Express",  color: "slate" },
  ESSENTIAL: { price: 499,  maxGuests: 120,  label: "Pro",      color: "blue"  },
  COMPLETE:  { price: 1199, maxGuests: 250,  label: "Completa", color: "champagne" },
  LUXURY:    { price: 999,  maxGuests: null, label: "Premium",  color: "gold"  },
} as const;
