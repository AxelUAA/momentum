"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { eventFormSchema, type EventFormData } from "@/types/event-form";
import type { Prisma } from "@prisma/client";

const VALID_EVENT_STATUSES = [
  "DRAFT",
  "PAID",
  "INTAKE_COMPLETE",
  "BUILDING",
  "REVIEW",
  "CHANGES_REQUESTED",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
] as const;
type EventStatus = (typeof VALID_EVENT_STATUSES)[number];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createEvent(data: EventFormData) {
  const user = await requireAdmin();

  const parsed = eventFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validación fallida: ${parsed.error.issues.map(i => i.path.join(".") + ": " + i.message).join(" | ")}`,
    };
  }

  try {
    const existing = await prisma.event.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return { success: false, error: "Este slug ya está en uso, elige otro" };
    }

    const defaultTemplate = await prisma.template.findFirst({
      where: {
        OR: [
          { name: "Aurora" },
          { slug: "aurora" }
        ]
      }
    });

    if (!defaultTemplate) {
      return { success: false, error: "Template Aurora no encontrada en DB" };
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      select: {
        id: true,
        plan: true,
      },
    });

    let paymentStatus: "UNPAID" | "PAID" = "UNPAID";
    let subscriptionId: string | null = null;
    let activeUntil: Date | null = null;

    if (activeSubscription) {
      const planLimits = {
        ORGANIZADOR_PLUS: 5,
        ORGANIZADOR_PRO: 20,
      } as const;

      const paidEventsCount = await prisma.event.count({
        where: {
          subscriptionId: activeSubscription.id,
          paymentStatus: "PAID",
        },
      });

      const planLimit = planLimits[activeSubscription.plan];
      if (paidEventsCount >= planLimit) {
        return { success: false, error: "Plan excede límite de eventos" };
      }

      paymentStatus = "PAID";
      subscriptionId = activeSubscription.id;
      const baseDate = parsed.data.eventDate ? new Date(parsed.data.eventDate) : new Date();
      activeUntil = new Date(baseDate);
      activeUntil.setDate(activeUntil.getDate() + 60);
    }

    const event = await prisma.event.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        type: parsed.data.type,
        tier: parsed.data.tier,
        status: "DRAFT",
        paymentStatus,
        subscriptionId,
        activeUntil,
        eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
        coverImage: parsed.data.coverImage ?? null,
        activeSections: parsed.data.activeSections,
        location: parsed.data.reception?.address || parsed.data.ceremony?.address || "",
        settings: {
          story: parsed.data.story,
          timeline: parsed.data.timeline?.map(item => ({
            year: item.year,
            title: item.title,
            desc: item.description,
            image: item.image
          })),
          gallery: parsed.data.gallery || [],
          ceremony: {
            time: parsed.data.ceremony?.time || "",
            name: parsed.data.ceremony?.venueName || "",
            address: parsed.data.ceremony?.address || "",
            mapsUrl: parsed.data.ceremony?.mapsUrl || ""
          },
          reception: {
            time: parsed.data.reception?.time || "",
            name: parsed.data.reception?.venueName || "",
            address: parsed.data.reception?.address || "",
            mapsUrl: parsed.data.reception?.mapsUrl || ""
          },
          dressCode: parsed.data.dressCode ? {
            name: parsed.data.dressCode.title || "",
            description: parsed.data.dressCode.description || "",
            images: parsed.data.dressCode.images || []
          } : undefined,
          colors: parsed.data.colors,
          giftRegistry: parsed.data.giftRegistry?.filter(item => item.url && item.url.length > 0) || [],
          rsvpDeadline: parsed.data.rsvpDeadline,
          client: {
            name: parsed.data.clientName,
            email: parsed.data.clientEmail,
            phone: parsed.data.clientPhone,
          },
        },
        userId: user.id,
        templateId: defaultTemplate.id,
      },
    });

    revalidatePath("/dashboard/events");
    return { success: true, event };
  } catch (e) {
    console.error("[createEvent] error:", e);
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function updateEvent(id: string, data: Partial<EventFormData>) {
  await requireAdmin();

  try {
    const current = await prisma.event.findUnique({
      where: { id },
      select: { settings: true, slug: true },
    });
    if (!current) {
      return { success: false, error: "Evento no encontrado" };
    }

    const updateData: Prisma.EventUpdateInput = {};
    if (data.title) updateData.title = data.title;
    if (data.slug) updateData.slug = data.slug;
    if (data.type) updateData.type = data.type;
    if (data.tier) updateData.tier = data.tier;
    if (data.eventDate) updateData.eventDate = new Date(data.eventDate);
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.activeSections) updateData.activeSections = data.activeSections;

    // DEEP MERGE: nunca reemplazar settings completo. Construimos el patch parcial
    // y lo mergeamos sobre el JSON actual para que editar una sección no borre las demás.
    const patch: Record<string, unknown> = {};
    if (data.story !== undefined) patch.story = data.story;
    if (data.timeline !== undefined) {
      patch.timeline = data.timeline.map((item) => ({
        year: item.year,
        title: item.title,
        desc: item.description,
        image: item.image,
      }));
    }
    if (data.gallery !== undefined) patch.gallery = data.gallery;
    if (data.ceremony !== undefined) {
      patch.ceremony = {
        time: data.ceremony.time,
        name: data.ceremony.venueName,
        address: data.ceremony.address,
        mapsUrl: data.ceremony.mapsUrl,
      };
    }
    if (data.reception !== undefined) {
      patch.reception = {
        time: data.reception.time,
        name: data.reception.venueName,
        address: data.reception.address,
        mapsUrl: data.reception.mapsUrl,
      };
    }
    if (data.dressCode !== undefined) {
      patch.dressCode = {
        name: data.dressCode.title,
        description: data.dressCode.description,
        images: data.dressCode.images,
      };
    }
    if (data.colors !== undefined) patch.colors = data.colors;
    if (data.giftRegistry !== undefined) patch.giftRegistry = data.giftRegistry;
    if (data.rsvpDeadline !== undefined) patch.rsvpDeadline = data.rsvpDeadline;

    if (Object.keys(patch).length > 0) {
      const currentSettings =
        current.settings && typeof current.settings === "object" && !Array.isArray(current.settings)
          ? (current.settings as Record<string, unknown>)
          : {};
      updateData.settings = { ...currentSettings, ...patch } as Prisma.InputJsonValue;
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/dashboard/events/${id}`);
    revalidatePath(`/dashboard/events`);
    revalidatePath(`/e/${event.slug}`);
    return { success: true, event };
  } catch (error) {
    console.error("[updateEvent] error:", error);
    return { success: false, error: "Error al actualizar el evento" };
  }
}

export async function duplicateEvent(id: string) {
  await requireAdmin();
  const original = await prisma.event.findUnique({ where: { id } });
  if (!original) return { success: false, error: "Evento no encontrado" };

  try {
    // Excluimos campos que NO deben copiarse: id, timestamps, y todo el estado de pago.
    // El duplicado nace UNPAID y sin links a Stripe.
    const {
      id: _id,
      createdAt: _c,
      updatedAt: _u,
      stripeCheckoutId: _sc,
      stripePaymentIntentId: _spi,
      paidAt: _pa,
      activeUntil: _au,
      subscriptionId: _sid,
      paymentStatus: _ps,
      slug: _slug,
      title: _title,
      status: _status,
      ...data
    } = original;

    const copy = await prisma.event.create({
      data: {
        ...(data as Prisma.EventUncheckedCreateInput),
        slug: `${original.slug}-copia-${Date.now().toString().slice(-4)}`,
        title: `${original.title} (copia)`,
        status: "DRAFT",
        paymentStatus: "UNPAID",
        stripeCheckoutId: null,
        stripePaymentIntentId: null,
        paidAt: null,
        activeUntil: null,
        subscriptionId: null,
      },
    });
    revalidatePath("/dashboard/events");
    return { success: true, event: copy };
  } catch (e) {
    console.error("[duplicateEvent] error:", e);
    return { success: false, error: "Error al duplicar el evento" };
  }
}

export async function archiveEvent(id: string) {
  await requireAdmin();
  try {
    const event = await prisma.event.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    revalidatePath("/dashboard/events");
    return { success: true, event };
  } catch (e) {
    console.error("[archiveEvent] error:", e);
    return { success: false, error: "Error al archivar el evento" };
  }
}

export async function updateEventStatus(id: string, status: string) {
  await requireAdmin();

  if (!VALID_EVENT_STATUSES.includes(status as EventStatus)) {
    return { success: false, error: `Status inválido: ${status}` };
  }

  try {
    const event = await prisma.event.update({
      where: { id },
      data: { status: status as EventStatus },
    });
    revalidatePath("/dashboard/events");
    revalidatePath(`/dashboard/events/${id}`);
    return { success: true, event };
  } catch (e) {
    console.error("[updateEventStatus] error:", e);
    return { success: false, error: "Error al actualizar el status" };
  }
}

export async function updateActiveSections(id: string, sections: Prisma.InputJsonValue) {
  await requireAdmin();
  try {
    const event = await prisma.event.update({
      where: { id },
      data: { activeSections: sections },
    });
    revalidatePath(`/dashboard/events/${id}`);
    revalidatePath(`/e/${event.slug}`);
    return { success: true, event };
  } catch (e) {
    console.error("[updateActiveSections] error:", e);
    return { success: false, error: "Error al actualizar secciones" };
  }
}

export async function deleteEvent(id: string) {
  await requireAdmin();

  try {
    const supabase = createAdminClient();
    const { data: files } = await supabase.storage
      .from('event-images')
      .list(id);

    if (files && files.length > 0) {
      const categories = ['cover', 'gallery', 'dress-code', 'timeline'];
      for (const cat of categories) {
        const { data: catFiles } = await supabase.storage
          .from('event-images')
          .list(`${id}/${cat}`);

        if (catFiles && catFiles.length > 0) {
          const paths = catFiles.map(f => `${id}/${cat}/${f.name}`);
          await supabase.storage.from('event-images').remove(paths);
        }
      }
    }

    await prisma.event.delete({ where: { id } });

    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error("[deleteEvent] error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al eliminar evento",
    };
  }
}
