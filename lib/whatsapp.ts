import type { CartItem } from "@/components/store/cart-context";
import { BRAND } from "@/lib/brand";
import { formatPrice } from "@/lib/format";

/** Número de WhatsApp de la tienda (formato internacional sin +, ej. 5215512345678). */
export const WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "5210000000000";

export function buildOrderMessage(items: CartItem[], orderCode?: string): string {
  const lines = [
    `Hola, quiero hacer un pedido en ${BRAND.name}:`,
    "",
    ...items.map(
      (i) =>
        `• ${i.quantity}x ${i.name}${i.variantName ? ` — ${i.variantName}` : ""} (${formatPrice(i.priceCents * i.quantity)})`
    ),
    "",
    `Total: ${formatPrice(items.reduce((s, i) => s + i.priceCents * i.quantity, 0))}`,
  ];
  if (orderCode) lines.push(`Código de pedido: ${orderCode}`);
  return lines.join("\n");
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/** Normaliza un teléfono capturado a formato wa.me (MX: 10 dígitos → 521...). */
export function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `521${digits}`;
  if (digits.length === 12 && digits.startsWith("52")) return `521${digits.slice(2)}`;
  if (digits.length >= 11) return digits;
  return null;
}

/** Link de WhatsApp hacia el número de un cliente (no el de la tienda). */
export function whatsappLinkTo(phone: string, message: string): string | null {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
