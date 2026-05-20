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
// ESSENTIAL ($499): RSVP, galería, mapa, cuenta regresiva, 60 días
// LUXURY ($999): Todo lo anterior + música Spotify, libro de visitas,
//                generador WhatsApp, código de vestimenta, mesa de regalos
export const TIER_FEATURES = {
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
    activeDays: 60,
  },
} as const;

// ─── Información de tier ────────────────────────────────────────────────────
export const TIER_INFO = {
  EXPRESS:   { price: 299,  maxGuests: 60,   label: "Express",  color: "slate" },
  ESSENTIAL: { price: 499,  maxGuests: 120,  label: "Pro",      color: "blue"  },
  COMPLETE:  { price: 1199, maxGuests: 250,  label: "Completa", color: "champagne" },
  LUXURY:    { price: 999,  maxGuests: null, label: "Premium",  color: "gold"  },
} as const;
