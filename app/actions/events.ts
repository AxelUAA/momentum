"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eventFormSchema, type EventFormData } from "@/types/event-form";

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
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await prisma.event.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { success: false, error: "Este slug ya está en uso, elige otro" };
  }

  const defaultTemplate = await prisma.template.findFirst({ where: { slug: "aurora" } });
  if (!defaultTemplate) return { success: false, error: "Template Aurora no encontrada" };

  try {
    const event = await prisma.event.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        eventType: parsed.data.eventType,
        tier: parsed.data.tier,
        status: "DRAFT",
        eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
        activeSections: parsed.data.activeSections,
        location: parsed.data.reception?.address || parsed.data.ceremony?.address || "",
        settings: {
          story: parsed.data.story,
          timeline: parsed.data.timeline,
          ceremony: parsed.data.ceremony,
          reception: parsed.data.reception,
          dressCode: parsed.data.dressCode,
          colors: parsed.data.colors,
          giftRegistry: parsed.data.giftRegistry,
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
    return { success: true, eventId: event.id };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Error al crear el evento en la base de datos" };
  }
}

export async function updateEvent(id: string, data: Partial<EventFormData>) {
  await requireAdmin();
  
  // En una implementación real, aquí validaríamos la data parcial
  try {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.slug) updateData.slug = data.slug;
    if (data.eventType) updateData.eventType = data.eventType;
    if (data.tier) updateData.tier = data.tier;
    if (data.eventDate) updateData.eventDate = new Date(data.eventDate);
    if (data.activeSections) updateData.activeSections = data.activeSections;

    // Para settings, necesitaríamos hacer un deep merge o actualizar campos específicos
    // Por ahora simplificamos la actualización de campos básicos
    
    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/dashboard/events/${id}`);
    revalidatePath(`/dashboard/events`);
    revalidatePath(`/e/${event.slug}`);
    return { success: true, event };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: "Error al actualizar el evento" };
  }
}

export async function duplicateEvent(id: string) {
  const user = await requireAdmin();
  const original = await prisma.event.findUnique({ where: { id } });
  if (!original) return { success: false, error: "Evento no encontrado" };

  const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
  
  const duplicated = await prisma.event.create({
    data: {
      ...original,
      id: undefined, // Let Prisma generate a new CUID
      slug: newSlug,
      title: `${original.title} (Copia)`,
      status: "DRAFT",
      createdAt: undefined,
      updatedAt: undefined,
    } as any,
  });

  revalidatePath("/dashboard/events");
  return { success: true, event: duplicated };
}

export async function archiveEvent(id: string) {
  await requireAdmin();
  const event = await prisma.event.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  revalidatePath("/dashboard/events");
  return { success: true, event };
}

export async function updateEventStatus(id: string, status: any) {
  await requireAdmin();
  const event = await prisma.event.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/dashboard/events");
  revalidatePath(`/dashboard/events/${id}`);
  return { success: true, event };
}

export async function updateActiveSections(id: string, sections: any) {
  await requireAdmin();
  const event = await prisma.event.update({
    where: { id },
    data: { activeSections: sections },
  });
  revalidatePath(`/dashboard/events/${id}`);
  revalidatePath(`/e/${event.slug}`);
  return { success: true, event };
}
