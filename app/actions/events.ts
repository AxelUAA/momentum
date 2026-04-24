"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { eventFormSchema, type EventFormData } from "@/types/event-form";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createEvent(data: EventFormData) {
  console.log("[createEvent] Called with:", JSON.stringify(data, null, 2));
  
  const user = await requireAdmin();
  console.log("[createEvent] User:", user?.id, user?.email);

  const parsed = eventFormSchema.safeParse(data);
  if (!parsed.success) {
    console.error("[createEvent] Zod validation failed:", parsed.error.issues);
    return { 
      success: false, 
      error: `Validación fallida: ${parsed.error.issues.map(i => i.path.join(".") + ": " + i.message).join(" | ")}` 
    };
  }

  try {
    const existing = await prisma.event.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      console.error("[createEvent] Slug already exists:", parsed.data.slug);
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
      console.error("[createEvent] Template Aurora not found");
      return { success: false, error: "Template Aurora no encontrada en DB" };
    }

    const event = await prisma.event.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        type: parsed.data.type,
        tier: parsed.data.tier,
        status: "DRAFT",
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

    console.log("[createEvent] Event created successfully:", event.id);
    revalidatePath("/dashboard/events");
    return { success: true, event };
  } catch (e) {
    console.error("[createEvent] Prisma error:", e);
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function updateEvent(id: string, data: Partial<EventFormData>) {
  await requireAdmin();
  
  // En una implementación real, aquí validaríamos la data parcial
  try {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.slug) updateData.slug = data.slug;
    if (data.type) updateData.type = data.type;
    if (data.tier) updateData.tier = data.tier;
    if (data.eventDate) updateData.eventDate = new Date(data.eventDate);
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.activeSections) updateData.activeSections = data.activeSections;

    // Build settings object for deep update
    const settings: any = {};
    if (data.story !== undefined) settings.story = data.story;
    if (data.timeline !== undefined) settings.timeline = data.timeline.map((item: any) => ({
      year: item.year,
      title: item.title,
      desc: item.description,
      image: item.image
    }));
    if (data.gallery !== undefined) settings.gallery = data.gallery;
    if (data.ceremony !== undefined) settings.ceremony = {
      time: data.ceremony.time,
      name: data.ceremony.venueName,
      address: data.ceremony.address,
      mapsUrl: data.ceremony.mapsUrl
    };
    if (data.reception !== undefined) settings.reception = {
      time: data.reception.time,
      name: data.reception.venueName,
      address: data.reception.address,
      mapsUrl: data.reception.mapsUrl
    };
    if (data.dressCode !== undefined) settings.dressCode = {
      name: data.dressCode.title,
      description: data.dressCode.description,
      images: data.dressCode.images
    };
    if (data.colors !== undefined) settings.colors = data.colors;
    if (data.giftRegistry !== undefined) settings.giftRegistry = data.giftRegistry;
    if (data.rsvpDeadline !== undefined) settings.rsvpDeadline = data.rsvpDeadline;

    if (Object.keys(settings).length > 0) {
      updateData.settings = settings;
    }

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
  await requireAdmin();
  const original = await prisma.event.findUnique({ where: { id } });
  if (!original) return { success: false, error: "Evento no encontrado" };

  try {
    const { id: _, createdAt: __, updatedAt: ___, ...data } = original;
    const copy = await prisma.event.create({
      data: {
        ...(data as any),
        slug: `${original.slug}-copia-${Date.now().toString().slice(-4)}`,
        title: `${original.title} (copia)`,
        status: "DRAFT",
      },
    });
    revalidatePath("/dashboard/events");
    return { success: true, event: copy };
  } catch (e) {
    console.error("[duplicateEvent] Error:", e);
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
    console.error("[archiveEvent] Error:", e);
    return { success: false, error: "Error al archivar el evento" };
  }
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

export async function deleteEvent(id: string) {
  await requireAdmin();
  
  try {
    // Borrar imágenes de Supabase
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
    console.error("[deleteEvent] Error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al eliminar evento",
    };
  }
}
