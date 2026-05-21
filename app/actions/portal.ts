"use server";

import React from "react";
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
        type: true,
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

    const tf = data.typeFields;
    const patch: Record<string, unknown> = {};

    if (tf.spotifyUrl?.trim()) {
      patch.musicUrl = tf.spotifyUrl.trim();
    }

    if (tf.dressCode?.trim()) {
      const existingDressCode =
        (currentSettings.dressCode as Record<string, unknown>) ?? {};
      patch.dressCode = {
        title: "Código de vestimenta",
        description: tf.dressCode.trim(),
        images: (existingDressCode.images as string[]) ?? [],
      };
    }

    if (tf.giftRegistry?.trim()) {
      patch.giftRegistry = [
        { store: "Mesa de regalos", url: tf.giftRegistry.trim() },
      ];
    }

    switch (event.type) {
      case "WEDDING":
        if (tf.coupleName?.trim() && !currentSettings.story) {
          patch.story = `${tf.coupleName.trim()} se unen en matrimonio.`;
        }
        if (data.locationName?.trim()) {
          const existingCeremony =
            (currentSettings.ceremony as Record<string, unknown>) ?? {};
          patch.ceremony = {
            ...existingCeremony,
            name: data.locationName.trim(),
            address:
              data.locationAddress?.trim() ??
              (existingCeremony.address as string) ??
              "",
          };
        }
        break;

      case "XV":
        if (tf.honoree?.trim()) {
          patch.celebrantName = tf.honoree.trim();
        }
        if (data.locationName?.trim()) {
          const existingFiesta =
            (currentSettings.fiesta as Record<string, unknown>) ?? {};
          patch.fiesta = {
            ...existingFiesta,
            name: data.locationName.trim(),
            address:
              data.locationAddress?.trim() ??
              (existingFiesta.address as string) ??
              "",
          };
        }
        break;

      case "BIRTHDAY":
        if (tf.honoree?.trim()) patch.celebrantName = tf.honoree.trim();
        if (tf.age?.trim()) {
          const age = parseInt(tf.age, 10);
          if (!isNaN(age)) patch.celebrantAge = age;
        }
        if (tf.theme?.trim()) patch.babyShowerTheme = tf.theme.trim();
        if (data.locationName?.trim()) {
          const existingVenue =
            (currentSettings.venue as Record<string, unknown>) ?? {};
          patch.venue = {
            ...existingVenue,
            name: data.locationName.trim(),
            address:
              data.locationAddress?.trim() ??
              (existingVenue.address as string) ??
              "",
          };
        }
        break;

      case "BABY_SHOWER":
        if (tf.honoree?.trim()) {
          const existingParents =
            (currentSettings.parentNames as Record<string, unknown>) ?? {};
          patch.parentNames = { ...existingParents, mom: tf.honoree.trim() };
        }
        if (tf.babyName?.trim()) patch.babyName = tf.babyName.trim();
        if (tf.theme?.trim()) patch.babyShowerTheme = tf.theme.trim();
        if (data.locationName?.trim()) {
          const existingVenue =
            (currentSettings.venue as Record<string, unknown>) ?? {};
          patch.venue = {
            ...existingVenue,
            name: data.locationName.trim(),
            address:
              data.locationAddress?.trim() ??
              (existingVenue.address as string) ??
              "",
          };
        }
        break;

      case "BAPTISM":
        if (tf.honoree?.trim()) patch.celebrantName = tf.honoree.trim();
        if (data.locationName?.trim()) {
          const existingCeremony =
            (currentSettings.ceremony as Record<string, unknown>) ?? {};
          patch.ceremony = {
            ...existingCeremony,
            name: data.locationName.trim(),
            address:
              data.locationAddress?.trim() ??
              (existingCeremony.address as string) ??
              "",
          };
        }
        break;

      case "GRADUATION":
        if (tf.honoree?.trim()) patch.celebrantName = tf.honoree.trim();
        if (data.locationName?.trim()) {
          const existingVenue =
            (currentSettings.venue as Record<string, unknown>) ?? {};
          patch.venue = {
            ...existingVenue,
            name: data.locationName.trim(),
            address:
              data.locationAddress?.trim() ??
              (existingVenue.address as string) ??
              "",
          };
        }
        break;

      case "CORPORATE":
        if (data.locationName?.trim()) {
          const existingVenue =
            (currentSettings.venue as Record<string, unknown>) ?? {};
          patch.venue = {
            ...existingVenue,
            name: data.locationName.trim(),
            address:
              data.locationAddress?.trim() ??
              (existingVenue.address as string) ??
              "",
          };
        }
        break;
    }

    const finalSettings = { ...updatedSettings, ...patch };

    await prisma.event.update({
      where: { id: event.id },
      data: {
        title: data.title.trim() || undefined,
        eventDate: eventDate ?? undefined,
        locationName: data.locationName.trim() || null,
        locationAddress: data.locationAddress.trim() || null,
        coverImage: data.coverImageUrl.trim() || undefined,
        intakeNotes: data.intakeNotes.trim() || null,
        settings: finalSettings,
        status: "INTAKE_COMPLETE",
      },
    });

    // 1. Confirmación al cliente
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
      console.error("[submitIntake] email al cliente falló:", emailErr);
    }

    // 2. Notificación al admin — nueva
    try {
      const { sendEmail, REPLY_TO_EMAIL } = await import("@/lib/email");
      const { resend } = await import("@/lib/email");
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://momentuminvites.com";
      const adminUrl = `${baseUrl}/dashboard/admin/operations/${event.id}`;
      const clientDisplay =
        data.typeFields?.coupleName ||
        data.typeFields?.honoree ||
        data.typeFields?.company ||
        event.title;

      const fieldLines = Object.entries(data.typeFields ?? {})
        .filter(([, v]) => v?.trim())
        .map(([k, v]) => `• ${k}: ${v}`)
        .join("\n");

      if (resend) {
        await sendEmail({
          to: REPLY_TO_EMAIL,
          subject: `📋 Nuevo intake listo — "${event.title}"`,
          react: React.createElement(
            "div",
            { style: { fontFamily: "sans-serif", padding: "24px", maxWidth: "600px" } },
            React.createElement("h2", { style: { marginBottom: "8px" } }, "Intake completado ✅"),
            React.createElement(
              "p",
              { style: { color: "#555", marginBottom: "16px" } },
              "El cliente ",
              React.createElement("strong", null, clientDisplay),
              " completó su información para ",
              React.createElement("strong", null, `"${event.title}"`),
              ". Ya puedes empezar a construir la invitación."
            ),
            fieldLines
              ? React.createElement(
                  "div",
                  { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", marginBottom: "16px" } },
                  React.createElement("p", { style: { fontWeight: "bold", margin: "0 0 8px" } }, "Datos del cliente:"),
                  React.createElement("pre", { style: { margin: 0, fontSize: "13px", whiteSpace: "pre-wrap", color: "#374151" } }, fieldLines)
                )
              : null,
            data.intakeNotes?.trim()
              ? React.createElement(
                  "div",
                  { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "16px", marginBottom: "16px" } },
                  React.createElement("p", { style: { fontWeight: "bold", margin: "0 0 8px" } }, "Notas adicionales:"),
                  React.createElement("p", { style: { margin: 0, fontSize: "13px", color: "#374151" } }, data.intakeNotes)
                )
              : null,
            React.createElement(
              "a",
              { href: adminUrl, style: { display: "inline-block", background: "#1e1b4b", color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" } },
              "Ver en operaciones →"
            )
          ),
        });
      }
    } catch (adminEmailErr) {
      console.error("[submitIntake] email al admin falló:", adminEmailErr);
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
