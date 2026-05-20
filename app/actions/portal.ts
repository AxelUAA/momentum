"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendPortalRecoveryEmail } from "@/lib/email-senders";
import { sendStatusEmail } from "@/lib/email";
import { generateUniqueToken } from "@/lib/guest-helpers";
import { z } from "zod";

export type PortalGuestData = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  uniqueToken: string;
  allowedGuests: number;
  rsvpStatus: string | null;
};

export type PortalEventData = {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  paymentStatus: string;
  tier: string;
  clientName: string | null;
  clientEmail: string | null;
  clientToken: string | null;
  eventDate: Date | null;
  locationName: string | null;
  locationAddress: string | null;
  intakeNotes: string | null;
  coverImage: string | null;
  gallery: string[];
  settings: Record<string, unknown>;
  paidAt: Date | null;
  activeUntil: Date | null;
  createdAt: Date;
  guests: PortalGuestData[];
  guestStats: {
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
  };
};

const clientGuestSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("").transform(() => undefined)),
  allowedGuests: z.coerce.number().min(1).max(20).default(1),
});

export async function getPortalData(
  clientToken: string,
): Promise<PortalEventData | null> {
  const event = await prisma.event.findUnique({
    where: { clientToken },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      status: true,
      paymentStatus: true,
      tier: true,
      clientName: true,
      clientEmail: true,
      clientToken: true,
      eventDate: true,
      locationName: true,
      locationAddress: true,
      intakeNotes: true,
      coverImage: true,
      settings: true,
      paidAt: true,
      activeUntil: true,
      createdAt: true,
      guests: {
        orderBy: { createdAt: "asc" as const },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          uniqueToken: true,
          allowedGuests: true,
          rsvp: { select: { status: true } },
        },
      },
    },
  });

  if (!event) return null;

  const total = event.guests.length;
  const confirmed = event.guests.filter((g) => g.rsvp?.status === "CONFIRMED").length;
  const declined = event.guests.filter((g) => g.rsvp?.status === "DECLINED").length;
  const pending = total - confirmed - declined;

  const settings = (event.settings as Record<string, unknown>) ?? {};
  const gallery = Array.isArray(settings.gallery) ? (settings.gallery as string[]) : [];

  return {
    ...event,
    coverImage: event.coverImage ?? null,
    gallery,
    settings,
    guests: event.guests.map((g) => ({
      id: g.id,
      name: g.name,
      phone: g.phone,
      email: g.email,
      uniqueToken: g.uniqueToken,
      allowedGuests: g.allowedGuests,
      rsvpStatus: g.rsvp?.status ?? null,
    })),
    guestStats: { total, confirmed, declined, pending },
  };
}

export type IntakeFormData = {
  title: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  locationAddress: string;
  coverImageUrl: string;
  intakeNotes: string;
  typeFields: Record<string, string>;
};

export async function submitIntake(
  clientToken: string,
  data: IntakeFormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const event = await prisma.event.findUnique({
      where: { clientToken },
      select: {
        id: true,
        status: true,
        settings: true,
        title: true,
        slug: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    if (!["PAID", "CHANGES_REQUESTED"].includes(event.status)) {
      return { success: false, error: "Este formulario ya no puede editarse." };
    }

    let eventDate: Date | null = null;
    const dateStr = data.eventDate;
    if (dateStr) {
      const timeStr = data.eventTime ?? "00:00";
      eventDate = new Date(`${dateStr}T${timeStr}:00`);
      if (isNaN(eventDate.getTime())) eventDate = null;
    }

    const currentSettings = (event.settings as Record<string, unknown>) ?? {};
    const updatedSettings = {
      ...currentSettings,
      intake: data.typeFields,
    };

    await prisma.event.update({
      where: { id: event.id },
      data: {
        title: data.title.trim() || undefined,
        eventDate: eventDate ?? undefined,
        locationName: data.locationName.trim() || null,
        locationAddress: data.locationAddress.trim() || null,
        coverImage: data.coverImageUrl.trim() || undefined,
        intakeNotes: data.intakeNotes.trim() || null,
        settings: updatedSettings,
        status: "INTAKE_COMPLETE",
      },
    });

    // Notificar al organizador que el intake fue completado
    try {
      if (event.user?.email) {
        await sendStatusEmail(
          {
            id: event.id,
            title: event.title,
            slug: event.slug,
            clientToken: clientToken,
            user: event.user,
          },
          "INTAKE_COMPLETE",
        );
      }
    } catch (emailErr) {
      console.error("[submitIntake] email notification failed:", emailErr);
    }

    revalidatePath(`/portal/${clientToken}`);
    return { success: true };
  } catch (error) {
    console.error("[submitIntake]", error);
    return {
      success: false,
      error: "Ocurrido un error al guardar. Intenta de nuevo.",
    };
  }
}

/**
 * Reenvía el link del portal al email del cliente.
 * Siempre retorna { sent: true } para no revelar si el email existe.
 */
export async function resendPortalLink(
  email: string,
): Promise<{ sent: boolean }> {
  if (!email || !email.includes("@")) return { sent: true };
  await sendPortalRecoveryEmail(email.trim().toLowerCase());
  return { sent: true };
}

async function requireClientEvent(clientToken: string) {
  const event = await prisma.event.findUnique({
    where: { clientToken },
    select: { id: true, status: true, slug: true },
  });
  if (!event) throw new Error("Portal no encontrado");
  const allowed = ["INTAKE_COMPLETE", "BUILDING", "REVIEW", "CHANGES_REQUESTED", "ACTIVE", "COMPLETED"];
  if (!allowed.includes(event.status)) throw new Error("No puedes gestionar invitados en este momento");
  return event;
}

export async function savePortalCoverImage(
  clientToken: string,
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const event = await prisma.event.findUnique({ where: { clientToken }, select: { id: true } });
    if (!event) return { success: false, error: "Portal no encontrado" };
    await prisma.event.update({ where: { id: event.id }, data: { coverImage: url } });
    revalidatePath(`/portal/${clientToken}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function addPortalGalleryImage(
  clientToken: string,
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const event = await prisma.event.findUnique({ where: { clientToken }, select: { id: true, settings: true } });
    if (!event) return { success: false, error: "Portal no encontrado" };
    const settings = (event.settings as Record<string, unknown>) ?? {};
    const gallery = Array.isArray(settings.gallery) ? [...(settings.gallery as string[])] : [];
    if (gallery.length >= 8) return { success: false, error: "Máximo 8 imágenes de galería" };
    gallery.push(url);
    await prisma.event.update({ where: { id: event.id }, data: { settings: { ...settings, gallery } } });
    revalidatePath(`/portal/${clientToken}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function removePortalGalleryImage(
  clientToken: string,
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const event = await prisma.event.findUnique({ where: { clientToken }, select: { id: true, settings: true } });
    if (!event) return { success: false, error: "Portal no encontrado" };
    const settings = (event.settings as Record<string, unknown>) ?? {};
    const gallery = Array.isArray(settings.gallery)
      ? (settings.gallery as string[]).filter((u) => u !== url)
      : [];
    await prisma.event.update({ where: { id: event.id }, data: { settings: { ...settings, gallery } } });
    revalidatePath(`/portal/${clientToken}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function addClientGuest(
  clientToken: string,
  data: { name: string; phone?: string; email?: string; allowedGuests: number },
): Promise<{ success: boolean; guest?: PortalGuestData; error?: string }> {
  try {
    const event = await requireClientEvent(clientToken);
    const parsed = clientGuestSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    let token = generateUniqueToken();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.guest.findUnique({ where: { uniqueToken: token } });
      if (!exists) break;
      token = generateUniqueToken();
    }

    const guest = await prisma.guest.create({
      data: {
        eventId: event.id,
        uniqueToken: token,
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email ?? null,
        allowedGuests: parsed.data.allowedGuests,
      },
      select: { id: true, name: true, phone: true, email: true, uniqueToken: true, allowedGuests: true },
    });

    revalidatePath(`/portal/${clientToken}`);
    return {
      success: true,
      guest: { ...guest, rsvpStatus: null },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al agregar invitado" };
  }
}

export async function removeClientGuest(
  clientToken: string,
  guestId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const event = await requireClientEvent(clientToken);
    const guest = await prisma.guest.findUnique({ where: { id: guestId }, select: { eventId: true } });
    if (!guest || guest.eventId !== event.id) return { success: false, error: "Invitado no encontrado" };

    await prisma.guest.delete({ where: { id: guestId } });
    revalidatePath(`/portal/${clientToken}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al eliminar invitado" };
  }
}

export async function importClientGuests(
  clientToken: string,
  guests: Array<{ name: string; phone?: string; email?: string; allowedGuests?: number }>,
): Promise<{ success: boolean; created?: number; failed?: number; errors?: string[]; error?: string }> {
  try {
    const event = await requireClientEvent(clientToken);

    const existing = await prisma.guest.findMany({
      where: { eventId: event.id },
      select: { phone: true, email: true },
    });
    const existingPhones = new Set(existing.map((g) => g.phone).filter(Boolean) as string[]);
    const existingEmails = new Set(existing.map((g) => g.email).filter(Boolean) as string[]);

    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const [i, row] of guests.entries()) {
      const parsed = clientGuestSchema.safeParse({ ...row, allowedGuests: row.allowedGuests ?? 1 });
      if (!parsed.success) {
        failed++;
        errors.push(`Fila ${i + 1}: ${parsed.error.issues[0].message}`);
        continue;
      }

      if (parsed.data.phone && existingPhones.has(parsed.data.phone)) {
        failed++;
        errors.push(`Fila ${i + 1}: Teléfono ya existe (${parsed.data.phone})`);
        continue;
      }
      if (parsed.data.email && existingEmails.has(parsed.data.email)) {
        failed++;
        errors.push(`Fila ${i + 1}: Email ya existe (${parsed.data.email})`);
        continue;
      }

      try {
        let token = generateUniqueToken();
        for (let attempt = 0; attempt < 5; attempt++) {
          const exists = await prisma.guest.findUnique({ where: { uniqueToken: token } });
          if (!exists) break;
          token = generateUniqueToken();
        }

        await prisma.guest.create({
          data: {
            eventId: event.id,
            uniqueToken: token,
            name: parsed.data.name,
            phone: parsed.data.phone ?? null,
            email: parsed.data.email ?? null,
            allowedGuests: parsed.data.allowedGuests,
          },
        });

        if (parsed.data.phone) existingPhones.add(parsed.data.phone);
        if (parsed.data.email) existingEmails.add(parsed.data.email);
        created++;
      } catch (e) {
        failed++;
        errors.push(`Fila ${i + 1}: ${e instanceof Error ? e.message : "error"}`);
      }
    }

    revalidatePath(`/portal/${clientToken}`);
    return { success: true, created, failed, errors };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al importar invitados" };
  }
}
