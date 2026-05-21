import { getTierFeatures } from "./event-sections-map";

/**
 * Dado el tier de un evento y las secciones activas guardadas en DB,
 * devuelve el objeto final de secciones permitidas.
 * Las secciones que no están habilitadas en el tier se fuerzan a false.
 */
export function resolveActiveSections(
  tier: string,
  activeSections: Record<string, boolean>,
): Record<string, boolean> {
  const features = getTierFeatures(tier);

  // Mapea cada sección del template al feature flag del tier que la controla.
  // null = sección base disponible en todos los tiers (no gated).
  const sectionToFeature: Record<string, keyof typeof features | null> = {
    welcomeEnvelope: null,
    hero: null,
    story: null,
    timeline: null,
    ceremony: null,
    reception: null,
    dressCode: "dressCode",
    gallery: "gallery",
    rsvp: "rsvp",
    giftRegistry: "giftRegistry",
    guestbook: "guestbook",
    spotify: "spotify",
  };

  const resolved: Record<string, boolean> = { ...activeSections };
  for (const [section, featureKey] of Object.entries(sectionToFeature)) {
    if (featureKey !== null && !(features[featureKey] as boolean)) {
      resolved[section] = false;
    }
  }
  return resolved;
}

/**
 * Verifica si agregar N invitados supera el límite del tier.
 */
export function checkGuestLimit(
  tier: string,
  currentGuestCount: number,
  toAdd = 1,
): { allowed: boolean; limit: number | null } {
  const { maxGuests } = getTierFeatures(tier);
  if (maxGuests === null) return { allowed: true, limit: null };
  return { allowed: currentGuestCount + toAdd <= maxGuests, limit: maxGuests };
}
