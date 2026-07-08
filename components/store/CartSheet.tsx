"use client";

import { useState } from "react";
import { X, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/store/cart-context";
import { formatPrice } from "@/lib/format";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { createShopOrder } from "@/app/actions/orders";

export function CartSheet() {
  const { items, isOpen, closeCart, setQuantity, removeItem, clearCart, totalCents } =
    useCart();
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  async function handleWhatsAppOrder() {
    setSending(true);
    try {
      const result = await createShopOrder({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      const code = result.ok ? result.code : undefined;
      const message = buildOrderMessage(items, code);
      window.open(whatsappLink(message), "_blank", "noopener,noreferrer");

      if (result.ok) {
        toast.success(`Pedido ${result.code} registrado`, {
          description: "Te contactamos por WhatsApp para confirmar entrega y pago.",
        });
        clearCart();
        closeCart();
      } else {
        toast.error(result.error);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        aria-label="Cerrar carrito"
        onClick={closeCart}
        className="absolute inset-0 h-full w-full cursor-default bg-background/60 backdrop-blur-sm"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-heading text-xl uppercase tracking-wide">Tu carrito</h2>
          <button
            onClick={closeCart}
            aria-label="Cerrar"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-lg font-semibold">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground">
              Explora el catálogo y agrega tus favoritos.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.variantId}`}
                    className="flex gap-4 rounded-2xl border border-border bg-background p-3"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      {item.variantName && (
                        <p className="truncate text-xs text-muted-foreground">
                          {item.variantName}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-bold text-accent">
                        {formatPrice(item.priceCents)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            onClick={() =>
                              setQuantity(item.productId, item.variantId, item.quantity - 1)
                            }
                            aria-label="Restar uno"
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              setQuantity(item.productId, item.variantId, item.quantity + 1)
                            }
                            aria-label="Sumar uno"
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          aria-label="Quitar del carrito"
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-heading text-2xl text-accent">
                  {formatPrice(totalCents)}
                </span>
              </div>
              <button
                onClick={handleWhatsAppOrder}
                disabled={sending}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-bold uppercase tracking-wide text-accent-foreground transition-colors duration-200 hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MessageCircle className="h-4 w-4" />
                {sending ? "Enviando..." : "Pedir por WhatsApp"}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Confirmamos entrega y forma de pago directamente por WhatsApp.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
