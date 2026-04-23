import { z } from "zod";

export const eventFormSchema = z.object({
  // Paso 1: Info básica
  eventType: z.enum(["WEDDING","XV","BIRTHDAY","CORPORATE","BAPTISM","GRADUATION","BABY_SHOWER","CASUAL","OTHER"]),
  tier: z.enum(["EXPRESS","ESSENTIAL","COMPLETE","LUXURY"]),
  title: z.string().min(3, "Mínimo 3 caracteres").max(100),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  eventDate: z.string().min(1, "Fecha requerida"),
  eventTime: z.string().optional(),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),

  // Paso 2: Historia y timeline
  story: z.string().optional(),
  timeline: z.array(z.object({
    year: z.string(),
    title: z.string(),
    description: z.string(),
  })).optional(),

  // Paso 3: Lugares
  ceremony: z.object({
    venueName: z.string(),
    address: z.string(),
    time: z.string(),
    mapsUrl: z.string().url().optional().or(z.literal("")),
  }).optional(),
  reception: z.object({
    venueName: z.string(),
    address: z.string(),
    time: z.string(),
    mapsUrl: z.string().url().optional().or(z.literal("")),
  }).optional(),

  // Paso 4: Dress code
  dressCode: z.object({
    title: z.string(),
    description: z.string(),
    inspirationImages: z.array(z.string().url()).optional(),
  }).optional(),

  // Paso 5: Config avanzada
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
  }).optional(),
  giftRegistry: z.array(z.object({
    store: z.string(),
    url: z.string().url(),
  })).optional(),
  rsvpDeadline: z.string().optional(),
  activeSections: z.record(z.string(), z.boolean()),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
