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
  PENDING: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  MAYBE: "bg-yellow-100 text-yellow-700",
};
