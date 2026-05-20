import { nanoid } from "nanoid";

export function generateUniqueToken(): string {
  return nanoid(8); // 8 caracteres alfanuméricos ej "x7f9k2ab"
}

export const RELATIONSHIP_LABELS: Record<string, string> = {
  FAMILY_BRIDE: "Familia de la novia",
  FAMILY_GROOM: "Familia del novio",
  FAMILY_BIRTHDAY: "Familia del festejado",
  FRIEND: "Amistad",
  WORK: "Trabajo",
  OTHER: "Otro",
};

export const INVITED_BY_LABELS: Record<string, string> = {
  BRIDE: "Novia",
  GROOM: "Novio",
  BOTH: "Ambos",
  HOST: "Anfitrión",
};

export const RSVP_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  DECLINED: "Rechazado",
  MAYBE: "Tal vez",
};

export const RSVP_STATUS_COLORS: Record<string, string> = {
  PENDING: "badge-status-neutral",
  CONFIRMED: "badge-status-success",
  DECLINED: "badge-status-danger",
  MAYBE: "badge-status-warning",
};
