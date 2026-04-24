"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
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

    return { success: true, data: rsvp }
  } catch (error) {
    console.error("Error submitting RSVP:", error)
    return { success: false, error: "No pudimos guardar tu respuesta. Intenta de nuevo." }
  }
}
