"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIME_TO_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

async function uploadToSupabase(file: File, path: string): Promise<{ success: boolean; url?: string; error?: string }> {
  if (file.size > 5 * 1024 * 1024) return { success: false, error: "El archivo excede el límite de 5MB" };
  if (!ALLOWED_TYPES.includes(file.type)) return { success: false, error: "Formato no permitido (jpg, png, webp)" };

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from("event-images").upload(path, file, { contentType: file.type, upsert: true });
  if (error) { console.error("[uploadToSupabase]", error); return { success: false, error: "Error al subir imagen" }; }

  const { data: { publicUrl } } = supabase.storage.from("event-images").getPublicUrl(path);
  return { success: true, url: publicUrl };
}

export async function uploadPortalImage(
  formData: FormData,
  clientToken: string,
  category: "cover" | "gallery",
): Promise<{ success: boolean; url?: string; error?: string }> {
  const event = await prisma.event.findUnique({
    where: { clientToken },
    select: { id: true, status: true },
  });
  if (!event) return { success: false, error: "Portal no encontrado" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No se encontró el archivo" };

  const ext = MIME_TO_EXT[file.type] || "jpg";
  const filename = category === "cover" ? `cover.${ext}` : `${crypto.randomUUID()}.${ext}`;
  const path = `${event.id}/${category === "cover" ? "cover" : "portal-gallery"}/${filename}`;

  return uploadToSupabase(file, path);
}

export async function uploadEventImage(
  formData: FormData,
  eventId: string,
  category: "cover" | "gallery" | "dress-code" | "timeline"
) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "No autorizado" };
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return { success: false, error: "Evento no encontrado" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No se encontró el archivo" };

  const ext = MIME_TO_EXT[file.type] || "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${eventId}/${category}/${filename}`;

  return uploadToSupabase(file, path);
}

export async function uploadClientImage(
  formData: FormData,
  eventId: string,
  category: "cover" | "gallery",
): Promise<{ success: boolean; url?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  const event = await prisma.event.findUnique({
    where: { id: eventId, userId: session.user.id },
    select: { id: true },
  });
  if (!event) return { success: false, error: "Evento no encontrado" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No se encontró el archivo" };

  const ext = MIME_TO_EXT[file.type] || "jpg";
  const filename = category === "cover" ? `cover.${ext}` : `${crypto.randomUUID()}.${ext}`;
  const path = `${event.id}/${category === "cover" ? "cover" : "gallery"}/${filename}`;

  return uploadToSupabase(file, path);
}

export async function deleteEventImage(url: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "No autorizado" };
  }

  // Si la URL no es de nuestro bucket de Supabase (e.g. placeholders de seed
  // data de Unsplash, imágenes externas, etc.), solo la desvinculamos del
  // formulario sin tocar storage (no existe ahí de todos modos).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !supabaseUrl || !url.startsWith(supabaseUrl) || !url.includes("/event-images/")) {
    return { success: true };
  }

  // Extraer el path de la URL pública de Supabase
  // Formato: https://{project}.supabase.co/storage/v1/object/public/event-images/{path}
  const urlParts = url.split("/event-images/");
  if (urlParts.length < 2) return { success: false, error: "URL de imagen inválida" };

  const path = urlParts[1].split("?")[0]; // Quitar query string si hubiera
  const eventId = path.split("/")[0];

  // Verificar que el evento exista
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return { success: false, error: "Evento no encontrado" };

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("event-images")
    .remove([path]);

  if (error) {
    console.error("[deleteEventImage] Supabase error:", error);
    return { success: false, error: "Error al borrar archivo de Supabase" };
  }

  return { success: true };
}
