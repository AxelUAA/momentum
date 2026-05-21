"use server";

import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateUniqueToken } from "@/lib/guest-helpers";
import { checkGuestLimit } from "@/lib/tier-gate";
import { sendStatusEmail } from "@/lib/email";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClientEventData = {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  paymentStatus: string;
  tier: string;
  clientName: string | null;
  clientEmail: string | null;
  eventDate: Date | null;
  locationName: string | null;
  locationAddress: string | null;
  intakeNotes: string | null;
  coverImage: string | null;
  gallery: string[];
  settings: Record<string, unknown>;
  activeUntil: Date | null;
  paidAt: Date | null;
  guests: Array<{
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    uniqueToken: string;
    allowedGuests: number;
    rsvpStatus: string | null;
    viewCount: number;
  }>;
  guestStats: { total: number; confirmed: number; declined: number; pending: number };
  viewStats: { total: number; last7Days: number; uniqueGuests: number };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  return session.user.id;
}

async function requireOwnEvent(eventId: string) {
  const userId = await requireSession();
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, userId: true, status: true, slug: true, paymentStatus: true, tier: true },
  });
  if (!event || event.userId !== userId) throw new Error("Evento no encontrado");
  return { event, userId };
}

function isEditable(status: string): boolean {
  return !["ACTIVE", "COMPLETED", "ARCHIVED"].includes(status);
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getClientEventData(eventId: string): Promise<ClientEventData | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const event = await prisma.event.findUnique({
    where: { id: eventId, userId: session.user.id },
    select: {
      id: true, title: true, slug: true, type: true,
      status: true, paymentStatus: true, tier: true,
      clientName: true, clientEmail: true,
      eventDate: true, locationName: true, locationAddress: true,
      intakeNotes: true, coverImage: true, settings: true,
      activeUntil: true, paidAt: true,
      guests: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true, name: true, phone: true, email: true,
          uniqueToken: true, allowedGuests: true,
          rsvp: { select: { status: true } },
          _count: { select: { invitationViews: true } },
        },
      },
    },
  });

  if (!event) return null;

  const settings = (event.settings as Record<string, unknown>) ?? {};
  const gallery = Array.isArray(settings.gallery) ? (settings.gallery as string[]) : [];
  const total = event.guests.length;
  const confirmed = event.guests.filter((g) => g.rsvp?.status === "CONFIRMED").length;
  const declined = event.guests.filter((g) => g.rsvp?.status === "DECLINED").length;

  const totalViews = event.guests.reduce((sum, g) => sum + g._count.invitationViews, 0);
  const uniqueGuestsViewed = event.guests.filter((g) => g._count.invitationViews > 0).length;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const viewsLast7Days = await prisma.invitationView.count({
    where: { guest: { eventId }, viewedAt: { gte: sevenDaysAgo } },
  });

  return {
    ...event,
    gallery,
    settings,
    guests: event.guests.map((g) => ({
      ...g,
      rsvpStatus: g.rsvp?.status ?? null,
      viewCount: g._count.invitationViews,
    })),
    guestStats: { total, confirmed, declined, pending: total - confirmed - declined },
    viewStats: { total: totalViews, last7Days: viewsLast7Days, uniqueGuests: uniqueGuestsViewed },
  };
}

// ─── Save event data ──────────────────────────────────────────────────────────

const saveDataSchema = z.object({
  title: z.string().min(1, "El nombre es requerido").max(150),
  clientName: z.string().max(150).optional(),
  clientEmail: z.string().email("Email inválido").optional().or(z.literal("").transform(() => undefined)),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  locationName: z.string().max(200).optional(),
  locationAddress: z.string().max(300).optional(),
  intakeNotes: z.string().max(1000).optional(),
  customFields: z.record(z.string(), z.string()).optional(),
});

export type SaveDataInput = z.infer<typeof saveDataSchema>;

export async function saveClientEventData(
  eventId: string,
  data: SaveDataInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { event } = await requireOwnEvent(eventId);

    if (!isEditable(event.status)) {
      return { success: false, error: "La invitación ya está activa y no puede editarse." };
    }

    const parsed = saveDataSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    let eventDate: Date | undefined = undefined;
    if (parsed.data.eventDate) {
      const time = parsed.data.eventTime ?? "00:00";
      const d = new Date(`${parsed.data.eventDate}T${time}:00`);
      if (!isNaN(d.getTime())) eventDate = d;
    }

    const current = await prisma.event.findUnique({
      where: { id: eventId },
      select: { settings: true },
    });
    const currentSettings = (current?.settings as Record<string, unknown>) ?? {};

    await prisma.event.update({
      where: { id: eventId },
      data: {
        title: parsed.data.title.trim(),
        clientName: parsed.data.clientName?.trim() || null,
        clientEmail: parsed.data.clientEmail?.trim().toLowerCase() || null,
        eventDate,
        locationName: parsed.data.locationName?.trim() || null,
        locationAddress: parsed.data.locationAddress?.trim() || null,
        intakeNotes: parsed.data.intakeNotes?.trim() || null,
        settings: { ...currentSettings, intake: parsed.data.customFields ?? {} } as any,
        ...(event.status === "PAID" ? { status: "INTAKE_COMPLETE" } : {}),
      },
    });

    revalidatePath(`/dashboard/mi-invitacion/${eventId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al guardar" };
  }
}

// ─── Images ───────────────────────────────────────────────────────────────────

export async function saveClientCoverImage(
  eventId: string,
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireOwnEvent(eventId);
    await prisma.event.update({ where: { id: eventId }, data: { coverImage: url } });
    revalidatePath(`/dashboard/mi-invitacion/${eventId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function addClientGalleryImage(
  eventId: string,
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireOwnEvent(eventId);
    const ev = await prisma.event.findUnique({ where: { id: eventId }, select: { settings: true } });
    const settings = (ev?.settings as Record<string, unknown>) ?? {};
    const gallery = Array.isArray(settings.gallery) ? [...(settings.gallery as string[])] : [];
    if (gallery.length >= 8) return { success: false, error: "Máximo 8 imágenes de galería" };
    gallery.push(url);
    await prisma.event.update({ where: { id: eventId }, data: { settings: { ...settings, gallery } } });
    revalidatePath(`/dashboard/mi-invitacion/${eventId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function removeClientGalleryImage(
  eventId: string,
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireOwnEvent(eventId);
    const ev = await prisma.event.findUnique({ where: { id: eventId }, select: { settings: true } });
    const settings = (ev?.settings as Record<string, unknown>) ?? {};
    const gallery = Array.isArray(settings.gallery)
      ? (settings.gallery as string[]).filter((u) => u !== url)
      : [];
    await prisma.event.update({ where: { id: eventId }, data: { settings: { ...settings, gallery } } });
    revalidatePath(`/dashboard/mi-invitacion/${eventId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

// ─── Guests ───────────────────────────────────────────────────────────────────

const guestSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("").transform(() => undefined)),
  allowedGuests: z.coerce.number().min(1).max(20).default(1),
});

const GUEST_ALLOWED_STATUSES = [
  "INTAKE_COMPLETE", "BUILDING", "REVIEW", "CHANGES_REQUESTED", "ACTIVE", "COMPLETED",
];

export async function addClientGuest(
  eventId: string,
  data: { name: string; phone?: string; email?: string; allowedGuests: number },
): Promise<{ success: boolean; guest?: ClientEventData["guests"][0]; error?: string }> {
  try {
    const { event } = await requireOwnEvent(eventId);
    if (!GUEST_ALLOWED_STATUSES.includes(event.status)) {
      return { success: false, error: "Aún no puedes agregar invitados en este momento" };
    }

    const parsed = guestSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    // Validar límite de invitados del tier
    const currentCount = await prisma.guest.count({ where: { eventId } });
    const { allowed, limit } = checkGuestLimit(event.tier, currentCount, 1);
    if (!allowed) {
      return {
        success: false,
        error: `Tu plan permite un máximo de ${limit} invitados. Actualiza tu plan para agregar más.`,
      };
    }

    let token = generateUniqueToken();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.guest.findUnique({ where: { uniqueToken: token } });
      if (!exists) break;
      token = generateUniqueToken();
    }

    const guest = await prisma.guest.create({
      data: {
        eventId,
        uniqueToken: token,
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email ?? null,
        allowedGuests: parsed.data.allowedGuests,
      },
      select: { id: true, name: true, phone: true, email: true, uniqueToken: true, allowedGuests: true },
    });

    revalidatePath(`/dashboard/mi-invitacion/${eventId}`);
    return { success: true, guest: { ...guest, rsvpStatus: null, viewCount: 0 } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al agregar invitado" };
  }
}

export async function removeClientGuest(
  eventId: string,
  guestId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireOwnEvent(eventId);
    const guest = await prisma.guest.findUnique({ where: { id: guestId }, select: { eventId: true } });
    if (!guest || guest.eventId !== eventId) return { success: false, error: "Invitado no encontrado" };
    await prisma.guest.delete({ where: { id: guestId } });
    revalidatePath(`/dashboard/mi-invitacion/${eventId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al eliminar invitado" };
  }
}

// ─── Free invitation ──────────────────────────────────────────────────────────

const freeInviteSchema = z.object({
  type: z.enum(["WEDDING", "XV", "BIRTHDAY", "BABY_SHOWER", "BAPTISM", "GRADUATION", "CORPORATE", "CASUAL", "OTHER"]),
  title: z.string().min(2, "Escribe al menos el nombre del evento").max(150),
  eventDate: z.string().optional(),
  locationName: z.string().max(200).optional(),
});

export type FreeInviteInput = z.infer<typeof freeInviteSchema>;

export async function createFreeInvitation(
  data: FreeInviteInput,
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const userId = await requireSession();

    const existing = await prisma.event.findFirst({
      where: { userId, tier: "FREE" },
      select: { id: true },
    });
    if (existing) {
      return {
        success: false,
        error: "Ya tienes una invitación gratis. Actualiza a un plan de pago para crear más.",
      };
    }

    const parsed = freeInviteSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const template = await prisma.template.findFirst({
      where: { isActive: true },
      select: { id: true },
      orderBy: { sortOrder: "asc" },
    });
    if (!template) return { success: false, error: "No hay plantillas disponibles" };

    const slugBase = parsed.data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 30);
    const slug = `${slugBase}-gratis-${Date.now().toString(36)}`;

    let eventDate: Date | null = null;
    if (parsed.data.eventDate) {
      const d = new Date(`${parsed.data.eventDate}T00:00:00`);
      if (!isNaN(d.getTime())) eventDate = d;
    }

    const event = await prisma.event.create({
      data: {
        userId,
        templateId: template.id,
        title: parsed.data.title,
        slug,
        type: parsed.data.type,
        tier: "FREE",
        status: "DRAFT",
        paymentStatus: "UNPAID",
        eventDate,
        locationName: parsed.data.locationName?.trim() || null,
        settings: {},
      },
    });

    revalidatePath("/dashboard");
    return { success: true, eventId: event.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al crear la invitación" };
  }
}

// ─── Subscriber events ────────────────────────────────────────────────────────

export type SubscriberEventInput = {
  type: string;
  templateSlug: string;
  title: string;
  eventDate?: string;
};

export async function createSubscriberEvent(
  data: SubscriberEventInput,
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "No autenticado" };

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: {
        id: true,
        plan: true,
        _count: { select: { events: { where: { paymentStatus: "PAID" } } } },
      },
    });

    if (!subscription) {
      return { success: false, error: "No tienes una suscripción activa." };
    }

    const planLimits = { ORGANIZADOR_PLUS: 5, ORGANIZADOR_PRO: 20 } as const;
    const limit = planLimits[subscription.plan as keyof typeof planLimits] ?? 5;
    if (subscription._count.events >= limit) {
      return {
        success: false,
        error: `Tu plan permite hasta ${limit} eventos activos. Archiva uno para crear otro.`,
      };
    }

    const tierByPlan = {
      ORGANIZADOR_PLUS: "ESSENTIAL",
      ORGANIZADOR_PRO: "COMPLETE",
    } as const;
    const tier = tierByPlan[subscription.plan as keyof typeof tierByPlan] ?? "ESSENTIAL";

    const VALID_TYPES = ["WEDDING","XV","BIRTHDAY","BABY_SHOWER","BAPTISM","GRADUATION","CORPORATE","CASUAL","OTHER"];
    const eventType = VALID_TYPES.includes(data.type) ? data.type : "WEDDING";

    const template =
      (await prisma.template.findUnique({ where: { slug: data.templateSlug }, select: { id: true } })) ??
      (await prisma.template.findUnique({ where: { slug: "aurora" }, select: { id: true } }));

    if (!template) return { success: false, error: "Plantilla no encontrada." };

    const base = data.title.trim()
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 35);
    const slug = `${base || "evento"}-${Date.now().toString(36)}`;

    let eventDate: Date | undefined;
    if (data.eventDate) {
      const d = new Date(data.eventDate);
      if (!isNaN(d.getTime())) eventDate = d;
    }

    const activeUntil = new Date();
    activeUntil.setDate(activeUntil.getDate() + 60);

    const newEvent = await prisma.event.create({
      data: {
        userId: session.user.id,
        templateId: template.id,
        title: data.title.trim() || "Nueva invitación",
        slug,
        type: eventType as any,
        tier: tier as any,
        status: "PAID",
        paymentStatus: "PAID",
        paidAt: new Date(),
        activeUntil,
        subscriptionId: subscription.id,
        activeSections: {},
      },
    });

    revalidatePath("/dashboard");
    return { success: true, eventId: newEvent.id };
  } catch (error) {
    console.error("[createSubscriberEvent]", error);
    return { success: false, error: "Error al crear el evento. Intenta de nuevo." };
  }
}

// ─── Change requests ──────────────────────────────────────────────────────────

export async function submitChangeRequest(
  eventId: string,
  changeText: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "No autenticado" };

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        userId: true,
        status: true,
        title: true,
        slug: true,
        clientToken: true,
        clientName: true,
        intakeNotes: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!event || event.userId !== session.user.id) {
      return { success: false, error: "Evento no encontrado" };
    }

    if (event.status !== "ACTIVE") {
      return { success: false, error: "Solo puedes pedir cambios cuando tu invitación está activa" };
    }

    const text = changeText.trim();
    if (!text) return { success: false, error: "Escribe qué cambios necesitas" };
    if (text.length > 1000) return { success: false, error: "El mensaje no puede superar 1000 caracteres" };

    const timestamp = new Date().toLocaleDateString("es-MX", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    const prevNotes = event.intakeNotes ?? "";
    const separator = prevNotes ? "\n\n---\n" : "";
    const newNotes = `${prevNotes}${separator}📝 Cambios solicitados el ${timestamp}:\n${text}`;

    await prisma.event.update({
      where: { id: event.id },
      data: {
        status: "CHANGES_REQUESTED",
        intakeNotes: newNotes,
      },
    });

    const { sendEmail, REPLY_TO_EMAIL } = await import("@/lib/email");
    const { resend } = await import("@/lib/email");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://momentuminvites.com";
    const adminUrl = `${baseUrl}/dashboard/admin/operations/${event.id}`;
    const clientDisplay = event.clientName ?? event.user.name ?? event.user.email;

    if (resend) {
      await sendEmail({
        to: REPLY_TO_EMAIL,
        subject: `✏️ ${clientDisplay} pide cambios en "${event.title}"`,
        react: React.createElement(
          "div",
          { style: { fontFamily: "sans-serif", padding: "24px", maxWidth: "600px" } },
          React.createElement("h2", { style: { marginBottom: "8px" } }, "Solicitud de cambios"),
          React.createElement(
            "p",
            { style: { color: "#555", marginBottom: "16px" } },
            React.createElement("strong", null, clientDisplay),
            " ha solicitado cambios en su invitación ",
            React.createElement("strong", null, `"${event.title}"`),
            "."
          ),
          React.createElement(
            "div",
            { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", marginBottom: "20px" } },
            React.createElement("p", { style: { margin: 0, whiteSpace: "pre-wrap", color: "#1a1a1a" } }, text)
          ),
          React.createElement(
            "a",
            { href: adminUrl, style: { display: "inline-block", background: "#1e1b4b", color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" } },
            "Ver en operaciones →"
          )
        ),
      });
    }

    try {
      await sendStatusEmail(
        {
          id: event.id,
          title: event.title,
          slug: event.slug,
          clientToken: event.clientToken,
          user: event.user,
        },
        "CHANGES_REQUESTED",
      );
    } catch {
      // No bloquear si falla el email al cliente
    }

    revalidatePath(`/dashboard/mi-invitacion/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error("[submitChangeRequest]", error);
    return { success: false, error: "Error al enviar tu solicitud. Intenta de nuevo." };
  }
}
