"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateUniqueToken } from "@/lib/guest-helpers";
import { guestFormSchema, type GuestFormData } from "@/types/guest";
import { checkGuestLimit } from "@/lib/tier-gate";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createGuest(eventId: string, data: GuestFormData) {
  await requireAdmin();
  const parsed = guestFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Validar límite de invitados del tier
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { tier: true },
  });
  if (!event) return { success: false, error: "Evento no encontrado" };

  const currentCount = await prisma.guest.count({ where: { eventId } });
  const { allowed, limit } = checkGuestLimit(event.tier, currentCount, 1);
  if (!allowed) {
    return {
      success: false,
      error: `Tu plan permite un máximo de ${limit} invitados.`,
    };
  }

  // Genera token único, reintenta si hay colisión
  let token = generateUniqueToken();
  let attempts = 0;
  while (attempts < 5) {
    const exists = await prisma.guest.findUnique({ where: { uniqueToken: token } });
    if (!exists) break;
    token = generateUniqueToken();
    attempts++;
  }

  const guest = await prisma.guest.create({
    data: {
      eventId,
      uniqueToken: token,
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
      allowedGuests: parsed.data.allowedGuests,
      relationship: parsed.data.relationship ?? null,
      invitedBy: parsed.data.invitedBy ?? null,
      tableNumber: parsed.data.tableNumber ?? null,
      adminNotes: parsed.data.adminNotes ?? null,
    },
  });

  revalidatePath(`/dashboard/events/${eventId}/guests`);
  return { success: true, guest };
}

export async function updateGuest(id: string, data: Partial<GuestFormData>) {
  await requireAdmin();
  const parsed = guestFormSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  try {
    const guest = await prisma.guest.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email ?? null,
        allowedGuests: parsed.data.allowedGuests,
        relationship: parsed.data.relationship ?? null,
        invitedBy: parsed.data.invitedBy ?? null,
        tableNumber: parsed.data.tableNumber ?? null,
        adminNotes: parsed.data.adminNotes ?? null,
      },
    });
    revalidatePath(`/dashboard/events/${guest.eventId}/guests`);
    return { success: true, guest };
  } catch (e) {
    console.error("[updateGuest] Error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al actualizar invitado",
    };
  }
}

export async function deleteGuest(id: string) {
  await requireAdmin();
  const guest = await prisma.guest.delete({ where: { id } });
  revalidatePath(`/dashboard/events/${guest.eventId}/guests`);
  return { success: true };
}

export async function bulkCreateGuests(
  eventId: string,
  guests: GuestFormData[]
) {
  await requireAdmin();
  const results = { created: 0, failed: 0, errors: [] as string[] };

  try {
    // Validar límite de invitados del tier antes de procesar el batch
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { tier: true },
    });
    if (!event) return { success: false, error: "Evento no encontrado" };

    // Pre-fetch existing emails/phones for this event
    const existing = await prisma.guest.findMany({
      where: { eventId },
      select: { email: true, phone: true },
    });

    const currentCount = existing.length;
    const { allowed, limit } = checkGuestLimit(event.tier, currentCount, guests.length);
    if (!allowed) {
      return {
        success: false,
        error: `Tu plan permite un máximo de ${limit} invitados. Actualmente tienes ${currentCount} y estás intentando agregar ${guests.length}.`,
      };
    }

    const existingEmails = new Set(
      existing.map((g) => g.email).filter((v): v is string => Boolean(v))
    );
    const existingPhones = new Set(
      existing.map((g) => g.phone).filter((v): v is string => Boolean(v))
    );

    for (const [index, data] of guests.entries()) {
      const parsed = guestFormSchema.safeParse(data);
      if (!parsed.success) {
        results.failed++;
        results.errors.push(`Fila ${index + 1}: ${parsed.error.issues[0].message}`);
        continue;
      }

      if (parsed.data.email && existingEmails.has(parsed.data.email)) {
        results.failed++;
        results.errors.push(
          `Fila ${index + 1}: Email ya existe en este evento (${parsed.data.email})`
        );
        continue;
      }
      if (parsed.data.phone && existingPhones.has(parsed.data.phone)) {
        results.failed++;
        results.errors.push(
          `Fila ${index + 1}: Telefono ya existe en este evento (${parsed.data.phone})`
        );
        continue;
      }

      try {
        // Genera token único
        let token = generateUniqueToken();
        let attempts = 0;
        while (attempts < 5) {
          const exists = await prisma.guest.findUnique({
            where: { uniqueToken: token },
          });
          if (!exists) break;
          token = generateUniqueToken();
          attempts++;
        }

        await prisma.guest.create({
          data: {
            eventId,
            uniqueToken: token,
            name: parsed.data.name,
            phone: parsed.data.phone ?? null,
            email: parsed.data.email ?? null,
            allowedGuests: parsed.data.allowedGuests,
            relationship: parsed.data.relationship ?? null,
            invitedBy: parsed.data.invitedBy ?? null,
            tableNumber: parsed.data.tableNumber ?? null,
            adminNotes: parsed.data.adminNotes ?? null,
          },
        });

        // Agregar al Set para detectar duplicados dentro del mismo batch
        if (parsed.data.email) existingEmails.add(parsed.data.email);
        if (parsed.data.phone) existingPhones.add(parsed.data.phone);

        results.created++;
      } catch (e) {
        results.failed++;
        results.errors.push(
          `Fila ${index + 1}: ${e instanceof Error ? e.message : "error"}`
        );
      }
    }

    revalidatePath(`/dashboard/events/${eventId}/guests`);
    return {
      success: true,
      data: {
        created: results.created,
        failed: results.failed,
        errors: results.errors,
      },
    };
  } catch (e) {
    console.error("[bulkCreateGuests] Error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al importar invitados",
    };
  }
}
