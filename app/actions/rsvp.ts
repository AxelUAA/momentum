"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendRsvpNotification } from "@/lib/email-senders"
import type { RsvpStatus } from "@prisma/client"

type SubmitRsvpInput = {
  guestId: string
  status: RsvpStatus
  confirmedGuests: number
  menuPreference?: string
  dietaryRestrictions?: string
  message?: string
  eventSlug: string
  guestToken: string
}

export async function submitRsvp(input: SubmitRsvpInput) {
  try {
    // 1. Validar invitado, evento, status y fechas
    const guest = await prisma.guest.findUnique({
      where: { id: input.guestId },
      include: { event: true },
    });

    if (!guest || guest.uniqueToken !== input.guestToken || guest.event.slug !== input.eventSlug) {
      return { success: false, error: "Datos de invitado inválidos." };
    }

    if (guest.event.status !== "ACTIVE") {
      return { success: false, error: "Esta invitación no está activa." };
    }

    const settings = guest.event.settings as Record<string, unknown>;
    if (settings && typeof settings.rsvpDeadline === "string" && settings.rsvpDeadline) {
      const deadline = new Date(settings.rsvpDeadline);
      // Ajustar al final del día
      deadline.setHours(23, 59, 59, 999);
      if (new Date() > deadline) {
        return { success: false, error: "La fecha límite para confirmar asistencia ha pasado." };
      }
    }

    // Construir notes combinando menú + mensaje
    const notesArray = []
    if (input.menuPreference) notesArray.push(`Menú: ${input.menuPreference}`)
    if (input.message) notesArray.push(`Mensaje: ${input.message}`)
    const notes = notesArray.join("\n")

    const rsvp = await prisma.rsvp.upsert({
      where: { guestId: input.guestId },
      create: {
        guestId: input.guestId,
        status: input.status,
        confirmedGuests: input.confirmedGuests,
        dietaryRestrictions: input.dietaryRestrictions,
        message: notes || null,
        respondedAt: new Date()
      },
      update: {
        status: input.status,
        confirmedGuests: input.confirmedGuests,
        dietaryRestrictions: input.dietaryRestrictions,
        message: notes || null,
        respondedAt: new Date()
      }
    })

    revalidatePath(`/e/${input.eventSlug}/${input.guestToken}`)

    // Notificar al organizador (no bloquea la respuesta del RSVP si Resend falla)
    try {
      await sendRsvpNotification({
        guestId: input.guestId,
        status: input.status,
        confirmedGuests: input.confirmedGuests,
        message: input.message ?? null,
        dietaryRestrictions: input.dietaryRestrictions ?? null,
      })
    } catch (err) {
      console.error("[rsvp] email notification failed", err)
    }

    return { success: true, data: rsvp }
  } catch (error) {
    console.error("Error submitting RSVP:", error)
    return { success: false, error: "No pudimos guardar tu respuesta. Intenta de nuevo." }
  }
}
