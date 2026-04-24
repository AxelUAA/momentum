import { z } from "zod";

export const eventFormSchema = z.object({
  // Identificador (solo presente al editar un evento existente)
  id: z.string().optional(),

  // Paso 1: Info básica
  type: z.enum(["WEDDING","XV","BIRTHDAY","CORPORATE","BAPTISM","GRADUATION","BABY_SHOWER","CASUAL","OTHER"]),
  tier: z.enum(["EXPRESS","ESSENTIAL","COMPLETE","LUXURY"]),
  title: z.string().min(3, "Mínimo 3 caracteres").max(100),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  eventDate: z.string().min(1, "Fecha requerida"),
  eventTime: z.string().optional(),
  coverImage: z.string().url().nullable().optional(),
  clientName: z.string().min(1, "Nombre del cliente requerido"),
  clientEmail: z.string().email("Email inválido"),
  clientPhone: z.string().optional(),

  // Paso 2: Historia y timeline
  story: z.string().optional(),
  timeline: z.array(z.object({
    year: z.string(),
    title: z.string(),
    description: z.string(),
    image: z.string().url().optional(),
  })).optional(),

  // Paso 3: Lugares
  ceremony: z.object({
    venueName: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    time: z.string().optional().or(z.literal("")),
    mapsUrl: z.string().url().or(z.literal("")).optional(),
  }).optional(),
  reception: z.object({
    venueName: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    time: z.string().optional().or(z.literal("")),
    mapsUrl: z.string().url().or(z.literal("")).optional(),
  }).optional(),

  // Paso 4: Dress code
  dressCode: z.object({
    title: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    images: z.array(z.string().url()).optional().default([]),
  }).optional(),

  // Paso 5: Config avanzada
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
