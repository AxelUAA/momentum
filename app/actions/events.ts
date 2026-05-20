"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { sendStatusEmail } from "@/lib/email";
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

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createEvent(data: EventFormData) {
  // Todo el cuerpo va en try/catch para que cualquier throw (incluido el de
  // requireAdmin "Unauthorized") regrese al cliente como { success: false, error }
  // en lugar de un objeto vacío {} (que es lo que Next 16 serializa cuando
  // una server action lanza fuera del try).
  try {
    const user = await requireUser();

    const parsed = eventFormSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: `Validación fallida: ${parsed.error.issues.map(i => i.path.join(".") + ": " + i.message).join(" | ")}`,
      };
    }

    // Auto-generate defaults for optional fields
    const slug = parsed.data.slug || `evento-${Date.now().toString(36)}`;
    const title = parsed.data.title || "Nuevo evento";

    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "Este slug ya está en uso, elige otro" };
    }

    // Prefer the explicitly selected templateId; fall back to Aurora only if not found.
    let defaultTemplate = parsed.data.templateId
      ? await prisma.template.findUnique({ where: { id: parsed.data.templateId } })
      : null;
    if (!defaultTemplate) {
      defaultTemplate = await prisma.template.findFirst({
        where: { OR: [{ slug: "aurora" }, { name: "Aurora" }] },
      });
    }

    if (!defaultTemplate) {
      return { success: false, error: "Template no encontrada en DB" };
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
        slug: slug,
        title: title,
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
          eventTime: parsed.data.eventTime,
          // WEDDING
          story: parsed.data.story,
          timeline: parsed.data.timeline?.map(item => ({
            year: item.year,
            title: item.title,
            desc: item.description,
            image: item.image
          })),
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
          // BIRTHDAY / XV
          celebrantName: parsed.data.celebrantName,
          celebrantAge: parsed.data.celebrantAge,
          bio: parsed.data.bio,
          funFacts: parsed.data.funFacts,
          // BIRTHDAY / BABY_SHOWER
          venue: parsed.data.venue ? {
            time: parsed.data.venue.time || "",
            name: parsed.data.venue.venueName || "",
            address: parsed.data.venue.address || "",
            mapsUrl: parsed.data.venue.mapsUrl || ""
          } : undefined,
          wishList: parsed.data.wishList,
          // XV
          misa: parsed.data.misa ? {
            time: parsed.data.misa.time || "",
            name: parsed.data.misa.venueName || "",
            address: parsed.data.misa.address || "",
            mapsUrl: parsed.data.misa.mapsUrl || ""
          } : undefined,
          fiesta: parsed.data.fiesta ? {
            time: parsed.data.fiesta.time || "",
            name: parsed.data.fiesta.venueName || "",
            address: parsed.data.fiesta.address || "",
            mapsUrl: parsed.data.fiesta.mapsUrl || ""
          } : undefined,
          court: parsed.data.court,
          // BABY_SHOWER
          parentNames: parsed.data.parentNames,
          babyName: parsed.data.babyName,
          babyNameSurprise: parsed.data.babyNameSurprise,
          dueDate: parsed.data.dueDate,
          babyShowerTheme: parsed.data.babyShowerTheme,
          // Shared
          gallery: parsed.data.gallery || [],
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
  const user = await requireUser();

  try {
    const current = await prisma.event.findUnique({
      where: { id },
      select: { settings: true, slug: true, userId: true },
    });
    if (!current) {
      return { success: false, error: "Evento no encontrado" };
    }
    if (user.role !== "ADMIN" && current.userId !== user.id) {
      return { success: false, error: "No autorizado" };
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
    if (data.eventTime !== undefined) patch.eventTime = data.eventTime;

    // WEDDING
    if (data.story !== undefined) patch.story = data.story;
    if (data.timeline !== undefined) {
      patch.timeline = data.timeline.map((item) => ({
        year: item.year,
        title: item.title,
        desc: item.description,
        image: item.image,
      }));
    }
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

    // BIRTHDAY / XV
    if (data.celebrantName !== undefined) patch.celebrantName = data.celebrantName;
    if (data.celebrantAge !== undefined) patch.celebrantAge = data.celebrantAge;
    if (data.bio !== undefined) patch.bio = data.bio;
    if (data.funFacts !== undefined) patch.funFacts = data.funFacts;

    // BIRTHDAY / BABY_SHOWER – lugar único
    if (data.venue !== undefined) {
      patch.venue = {
        time: data.venue.time,
        name: data.venue.venueName,
        address: data.venue.address,
        mapsUrl: data.venue.mapsUrl,
      };
    }

    // BIRTHDAY / BABY_SHOWER – lista de deseos
    if (data.wishList !== undefined) patch.wishList = data.wishList;

    // XV – lugares misa y fiesta
    if (data.misa !== undefined) {
      patch.misa = {
        time: data.misa.time,
        name: data.misa.venueName,
        address: data.misa.address,
        mapsUrl: data.misa.mapsUrl,
      };
    }
    if (data.fiesta !== undefined) {
      patch.fiesta = {
        time: data.fiesta.time,
        name: data.fiesta.venueName,
        address: data.fiesta.address,
        mapsUrl: data.fiesta.mapsUrl,
      };
    }

    // XV – corte de honor
    if (data.court !== undefined) patch.court = data.court;

    // BABY_SHOWER
    if (data.parentNames !== undefined) patch.parentNames = data.parentNames;
    if (data.babyName !== undefined) patch.babyName = data.babyName;
    if (data.babyNameSurprise !== undefined) patch.babyNameSurprise = data.babyNameSurprise;
    if (data.dueDate !== undefined) patch.dueDate = data.dueDate;
    if (data.babyShowerTheme !== undefined) patch.babyShowerTheme = data.babyShowerTheme;

    // Shared
    if (data.gallery !== undefined) patch.gallery = data.gallery;
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
  const user = await requireUser();
  const original = await prisma.event.findUnique({ where: { id } });
  if (!original) return { success: false, error: "Evento no encontrado" };
  if (user.role !== "ADMIN" && original.userId !== user.id) {
    return { success: false, error: "No autorizado" };
  }

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
  const user = await requireUser();
  try {
    const current = await prisma.event.findUnique({ where: { id }, select: { userId: true } });
    if (!current) return { success: false, error: "Evento no encontrado" };
    if (user.role !== "ADMIN" && current.userId !== user.id) {
      return { success: false, error: "No autorizado" };
    }
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
  const user = await requireUser();

  if (!VALID_EVENT_STATUSES.includes(status as EventStatus)) {
    return { success: false, error: `Status inválido: ${status}` };
  }

  try {
    const current = await prisma.event.findUnique({
      where: { id },
      select: {
        userId: true,
        title: true,
        slug: true,
        clientToken: true,
        user: { select: { email: true, name: true } }
      }
    });
    if (!current) return { success: false, error: "Evento no encontrado" };
    if (user.role !== "ADMIN" && current.userId !== user.id) {
      return { success: false, error: "No autorizado" };
    }

    // Role-based state machine enforcement
    if (user.role !== "ADMIN") {
      const subscriberAllowed = ["ACTIVE", "ARCHIVED", "DRAFT"];
      if (status === "INTAKE_COMPLETE") {
        // Always allowed for owners (managed-service intake flow)
      } else if (subscriberAllowed.includes(status)) {
        // Only allowed for owners with an active subscription
        const subscription = await prisma.subscription.findFirst({
          where: { userId: user.id, status: "ACTIVE" },
          select: { id: true },
        });
        if (!subscription) {
          return { success: false, error: "Necesitas una suscripción activa para publicar eventos." };
        }
      } else {
        return { success: false, error: "No tienes permisos para establecer este estado." };
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: { status: status as EventStatus },
    });
    
    try {
      await sendStatusEmail({
        id: event.id,
        title: current.title,
        slug: current.slug,
        clientToken: current.clientToken,
        user: current.user!
      }, status);
    } catch (e) {
      console.error("Email failed:", e); // no rompe el flujo
    }

    revalidatePath("/dashboard/events");
    revalidatePath(`/dashboard/events/${id}`);
    revalidatePath(`/dashboard/mi-invitacion/${id}`);
    revalidatePath("/dashboard");
    return { success: true, event };
  } catch (e) {
    console.error("[updateEventStatus] error:", e);
    return { success: false, error: "Error al actualizar el status" };
  }
}

export async function updateActiveSections(id: string, sections: Prisma.InputJsonValue) {
  const user = await requireUser();
  try {
    const current = await prisma.event.findUnique({ where: { id }, select: { userId: true } });
    if (!current) return { success: false, error: "Evento no encontrado" };
    if (user.role !== "ADMIN" && current.userId !== user.id) {
      return { success: false, error: "No autorizado" };
    }
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
  const user = await requireUser();

  try {
    const current = await prisma.event.findUnique({ where: { id }, select: { userId: true } });
    if (!current) return { success: false, error: "Evento no encontrado" };
    if (user.role !== "ADMIN" && current.userId !== user.id) {
      return { success: false, error: "No autorizado" };
    }
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

export async function addClientNote(eventId: string, note: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return { success: false, error: "Evento no encontrado" };
    }

    // Authorization: User must own the event or be an ADMIN
    if (session.user.role !== "ADMIN" && event.userId !== session.user.id) {
      return { success: false, error: "No autorizado" };
    }

    // Business Logic: Notes should mainly be added when CHANGES_REQUESTED
    if (event.status !== "CHANGES_REQUESTED" && session.user.role !== "ADMIN") {
      return { success: false, error: "No se pueden enviar notas en el estado actual" };
    }

    // Add note to settings.clientNotes array
    const currentSettings = event.settings as Record<string, any> || {};
    const clientNotes = Array.isArray(currentSettings.clientNotes) ? currentSettings.clientNotes : [];
    
    clientNotes.push({
      text: note,
      createdAt: new Date().toISOString(),
      role: session.user.role
    });

    await prisma.event.update({
      where: { id: eventId },
      data: {
        settings: {
          ...currentSettings,
          clientNotes
        }
      }
    });

    revalidatePath(`/dashboard/events/${eventId}/progress`);
    return { success: true };
  } catch (error) {
    console.error("Error al agregar nota del cliente:", error);
    return { success: false, error: "Ocurrió un error al guardar la nota" };
  }
}
