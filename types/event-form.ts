import { z } from "zod";

// ─── Venue sub-schema (reutilizable) ───────────────────────────────────────

const venueSchema = z.object({
  venueName: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  time: z.string().optional().or(z.literal("")),
  mapsUrl: z.string().url().or(z.literal("")).optional(),
});

// ─── Wish list item ────────────────────────────────────────────────────────

const wishListItemSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  url: z.string().url().or(z.literal("")).optional(),
  priority: z.enum(["alta", "media", "baja"]).default("media"),
});

// ─── Court member (XV) ─────────────────────────────────────────────────────

const courtMemberSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  role: z.enum(["chambelan", "chambelana", "padrino", "madrina"]),
});

// ─── Main schema ───────────────────────────────────────────────────────────

export const eventFormSchema = z.object({
  // Identificador (solo presente al editar un evento existente)
  id: z.string().optional(),

  // Paso 1: Info básica (compartido)
  type: z.enum(["WEDDING","XV","BIRTHDAY","CORPORATE","BAPTISM","GRADUATION","BABY_SHOWER","CASUAL","OTHER"]),
  tier: z.enum(["FREE","EXPRESS","ESSENTIAL","COMPLETE","LUXURY"]),
  templateId: z.string().optional(),
  title: z.string().optional(),
  slug: z.union([z.string().regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"), z.literal("")]).optional(),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  coverImage: z.string().url().nullable().optional(),
  clientName: z.string().optional(),
  clientEmail: z.union([z.string().email("Email inválido"), z.literal("")]).optional(),
  clientPhone: z.string().optional(),

  // ── WEDDING: Historia y timeline ─────────────────────────────────────────
  story: z.string().optional(),
  timeline: z.array(z.object({
    year: z.string(),
    title: z.string(),
    description: z.string(),
    image: z.string().url().optional(),
  })).optional(),

  // ── WEDDING: Ceremonia + Recepción ───────────────────────────────────────
  ceremony: venueSchema.optional(),
  reception: venueSchema.optional(),

  // ── BIRTHDAY: Festejado ──────────────────────────────────────────────────
  celebrantName: z.string().optional(),
  celebrantAge: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().int().min(1).optional()
  ),
  bio: z.string().optional(),
  funFacts: z.array(z.string()).max(5).optional(),

  // ── BIRTHDAY / BABY_SHOWER: Lugar único ──────────────────────────────────
  venue: venueSchema.optional(),

  // ── BIRTHDAY / BABY_SHOWER: Lista de deseos ──────────────────────────────
  wishList: z.array(wishListItemSchema).optional(),

  // ── XV: Misa + Fiesta ────────────────────────────────────────────────────
  misa: venueSchema.optional(),
  fiesta: venueSchema.optional(),

  // ── XV: Corte de honor ───────────────────────────────────────────────────
  court: z.array(courtMemberSchema).optional(),

  // ── BABY_SHOWER ──────────────────────────────────────────────────────────
  parentNames: z.object({
    mom: z.string().optional(),
    dad: z.string().optional(),
  }).optional(),
  babyName: z.string().optional(),
  babyNameSurprise: z.boolean().optional(),
  dueDate: z.string().optional(),
  babyShowerTheme: z.string().optional(),

  // ── Shared: Dress code ───────────────────────────────────────────────────
  dressCode: z.object({
    title: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    images: z.array(z.string().url()).optional().default([]),
  }).optional(),

  // ── Shared: Config avanzada ──────────────────────────────────────────────
  gallery: z.array(z.string().url()).optional().default([]),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
  }).optional(),
  giftRegistry: z.array(z.object({
    store: z.string(),
    url: z.string().url().or(z.literal("")),
  })).optional(),
  rsvpDeadline: z.string().optional(),
  activeSections: z.record(z.string(), z.boolean()),
});

export type EventFormInput = z.input<typeof eventFormSchema>;
export type EventFormData = z.infer<typeof eventFormSchema>;
