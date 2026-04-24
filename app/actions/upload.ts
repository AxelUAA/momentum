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

  // Verificar que el evento exista (no filtramos por userId: cualquier admin puede gestionarlo)
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return { success: false, error: "Evento no encontrado" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No se encontró el archivo" };

  // Validar tamaño (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "El archivo excede el límite de 5MB" };
  }

  // Validar tipo MIME
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Formato de imagen no permitido (usar jpg, png o webp)" };
  }

  const supabase = createAdminClient();
  // Derivar extensión desde MIME type (confiable) porque browser-image-compression
  // suele devolver el File con nombre tipo "xxx.blob", lo que ensucia las URLs.
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const ext = mimeToExt[file.type] || "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${eventId}/${category}/${filename}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("[uploadEventImage] Supabase error:", error);
    return { success: false, error: "Error al subir a Supabase" };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("event-images")
    .getPublicUrl(path);

  return { success: true, url: publicUrl };
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
