/* ──────────────────────────────────────────────────────────────────────────────
 *  Event Settings — discriminated union por tipo de evento.
 *  Toda la información se persiste en el campo `settings` (Json) del modelo Event.
 *  No requiere cambios en la base de datos.
 * ────────────────────────────────────────────────────────────────────────────── */

// ─── Primitivos compartidos ────────────────────────────────────────────────

export type TimelineItem = {
  year: string;
  title: string;
  desc: string;
  image?: string;
};

export type DressCode = {
  name: string;
  description: string;
  images: string[];
};

export type EventLocationDetails = {
  time: string;
  name: string;
  address: string;
  mapsUrl?: string;
};

export type GiftRegistryConfig = {
  digitalEnvelope?: {
    enabled: boolean;
    suggestedAmount: number;
  };
  liverpool?: {
    enabled: boolean;
    eventCode: string;
  };
};

export type WishListItem = {
  name: string;
  url?: string;
  priority: "alta" | "media" | "baja";
};

export type CourtMember = {
  name: string;
  role: "chambelan" | "chambelana" | "padrino" | "madrina";
};

export type EventColors = {
  primary: string;
  accent: string;
  secondary: string;
};

// ─── Base (campos compartidos por todos los tipos) ─────────────────────────

export type BaseEventSettings = {
  coverImage: string | null;
  gallery: string[];
  dressCode: DressCode;
  rsvpDeadline: string;
  colors: EventColors;
  musicUrl: string | null;
};

// ─── Settings por tipo de evento ───────────────────────────────────────────

export type WeddingSettings = BaseEventSettings & {
  eventType: "WEDDING";
  story: string;
  timeline: TimelineItem[];
  ceremony: EventLocationDetails;
  reception: EventLocationDetails;
  giftRegistry: GiftRegistryConfig;
};

export type BirthdaySettings = BaseEventSettings & {
  eventType: "BIRTHDAY";
  celebrantName: string;
  celebrantAge: number;
  bio: string;
  funFacts: string[];
  venue: EventLocationDetails;
  wishList: WishListItem[];
};

export type QuinceSettings = BaseEventSettings & {
  eventType: "XV";
  celebrantName: string;
  story: string;
  misa: EventLocationDetails;
  fiesta: EventLocationDetails;
  court: CourtMember[];
  giftRegistry: GiftRegistryConfig;
};

export type BabyShowerSettings = BaseEventSettings & {
  eventType: "BABY_SHOWER";
  parentNames: { mom: string; dad?: string };
  babyName?: string;
  dueDate: string;
  theme: string;
  venue: EventLocationDetails;
  wishList: WishListItem[];
};

// ─── Unión discriminada ────────────────────────────────────────────────────

export type EventSettings =
  | WeddingSettings
  | BirthdaySettings
  | QuinceSettings
  | BabyShowerSettings;

// ─── Type guards ───────────────────────────────────────────────────────────

export function isWeddingSettings(s: EventSettings): s is WeddingSettings {
  return s.eventType === "WEDDING";
}

export function isBirthdaySettings(s: EventSettings): s is BirthdaySettings {
  return s.eventType === "BIRTHDAY";
}

export function isQuinceSettings(s: EventSettings): s is QuinceSettings {
  return s.eventType === "XV";
}

export function isBabyShowerSettings(s: EventSettings): s is BabyShowerSettings {
  return s.eventType === "BABY_SHOWER";
}
