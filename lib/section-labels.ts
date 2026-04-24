export const SECTION_LABELS: Record<string, string> = {
  welcomeEnvelope: "Sobre de bienvenida",
  hero: "Portada",
  story: "Historia",
  timeline: "Línea de tiempo",
  ceremony: "Ceremonia",
  reception: "Recepción",
  dressCode: "Código de vestimenta",
  gallery: "Galería",
  rsvp: "Confirmación (RSVP)",
  giftRegistry: "Mesa de regalos",
  guestbook: "Libro de invitados",
  spotify: "Votación musical",
};

export function sectionLabel(key: string): string {
  return SECTION_LABELS[key] ?? key;
}
