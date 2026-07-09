"use server";

import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";

const BUCKET = "product-images";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export async function uploadProductImage(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "No autorizado" };
  }

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No se encontró el archivo" };
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "El archivo excede el límite de 5MB" };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Formato no permitido (jpg, png, webp)" };
  }

  const ext = MIME_TO_EXT[file.type] || "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[uploadProductImage]", error);
    return { success: false, error: "Error al subir la imagen" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { success: true, url: publicUrl };
}

export async function deleteProductImage(
  url: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "No autorizado" };
  }

  // Solo borramos archivos de nuestro bucket; URLs externas o placeholders
  // locales solo se desvinculan del producto.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !supabaseUrl || !url.startsWith(supabaseUrl) || !url.includes(`/${BUCKET}/`)) {
    return { success: true };
  }

  const parts = url.split(`/${BUCKET}/`);
  if (parts.length < 2) return { success: false, error: "URL de imagen inválida" };
  const path = parts[1].split("?")[0];

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    console.error("[deleteProductImage]", error);
    return { success: false, error: "Error al borrar la imagen" };
  }

  return { success: true };
}
