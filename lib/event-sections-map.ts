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
  CASUAL: {
    welcomeEnvelope: false, hero: true, story: false, timeline: false,
    ceremony: false, reception: true, dressCode: false, gallery: false,
    rsvp: true, giftRegistry: false, guestbook: false, spotify: false,
  },
  OTHER: {
    welcomeEnvelope: false, hero: true, story: false, timeline: false,
    ceremony: false, reception: true, dressCode: false, gallery: true,
    rsvp: true, giftRegistry: false, guestbook: false, spotify: false,
  },
} as const;

export const TIER_INFO = {
  EXPRESS: { price: 299, maxGuests: 60, label: "Express", color: "slate" },
  ESSENTIAL: { price: 599, maxGuests: 120, label: "Esencial", color: "blue" },
  COMPLETE: { price: 1199, maxGuests: 250, label: "Completa", color: "champagne" },
  LUXURY: { price: 2199, maxGuests: null, label: "Lujo", color: "gold" },
} as const;
