import { z } from "zod";

// Preprocess helper: trata "" como undefined para enums opcionales y strings
const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const RelationshipEnum = z.enum([
  "FAMILY_BRIDE",
  "FAMILY_GROOM",
  "FAMILY_BIRTHDAY",
  "FRIEND",
  "WORK",
  "OTHER",
]);

export const InvitedByEnum = z.enum(["BRIDE", "GROOM", "BOTH", "HOST"]);

export const guestFormSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  phone: z.preprocess(emptyToUndefined, z.string().optional()),
  email: z.preprocess(emptyToUndefined, z.string().email("Email invalido").optional()),
  allowedGuests: z.coerce.number().min(0).max(10).default(0),
  relationship: z.preprocess(emptyToUndefined, RelationshipEnum.optional()),
  invitedBy: z.preprocess(emptyToUndefined, InvitedByEnum.optional()),
  tableNumber: z.preprocess(emptyToUndefined, z.string().optional()),
  adminNotes: z.preprocess(emptyToUndefined, z.string().optional()),
});

// GuestFormInput: lo que el formulario ENVIA (acepta "" antes del preprocess)
export type GuestFormInput = z.input<typeof guestFormSchema>;
// GuestFormData: lo que sale DESPUES de la validacion Zod (ya tipado)
export type GuestFormData = z.infer<typeof guestFormSchema>;
export type GuestRelationship = z.infer<typeof RelationshipEnum>;
export type GuestInvitedBy = z.infer<typeof InvitedByEnum>;
