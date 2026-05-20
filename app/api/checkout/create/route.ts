import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/checkout/create
 *
 * Requiere sesión activa. Inicia un checkout de Stripe usando los datos
 * del usuario logueado — no se recogen nombre/email en el body.
 *
 * Body: { templateSlug: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Auth required
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Debes iniciar sesión para comprar" }, { status: 401 });
    }

    const body = await request.json();
    const { templateSlug } = body as { templateSlug?: string };

    if (!templateSlug?.trim()) {
      return NextResponse.json({ error: "Debes seleccionar una plantilla" }, { status: 400 });
    }

    // Buscar plantilla en DB
    const template = await prisma.template.findUnique({
      where: { slug: templateSlug, isActive: true },
      select: { id: true, slug: true, type: true, isPremium: true, name: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Plantilla no encontrada o no disponible" }, { status: 404 });
    }

    const tier = template.isPremium ? "LUXURY" : "ESSENTIAL";
    const priceId = template.isPremium
      ? STRIPE_PRICES.invitacionPremium
      : STRIPE_PRICES.invitacionPro;

    if (!priceId) {
      console.error("[checkout/create] Price ID no configurado para tier:", tier);
      return NextResponse.json({ error: "Configuración de precio incompleta. Contacta soporte." }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://momentum-alpha-six.vercel.app";

    // Upsert Stripe customer linked to the DB user
    let stripeCustomerId = session.user.stripeCustomerId ?? undefined;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: session.user.name ?? undefined,
        email: session.user.email,
        metadata: { userId: session.user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId },
      });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,
      payment_method_types: ["card", "oxxo"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/buy?template=${template.slug}`,
      locale: "es-419",
      metadata: {
        type: "public-checkout",
        templateSlug: template.slug,
        tier,
        eventType: template.type,
        // Pass userId so fulfillment links event to the correct account
        userId: session.user.id,
        clientName: session.user.name ?? "",
        clientEmail: session.user.email,
      },
    });

    if (!stripeSession.url) {
      return NextResponse.json({ error: "No se pudo generar la URL de Stripe" }, { status: 500 });
    }

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[checkout/create]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear el checkout" },
      { status: 500 },
    );
  }
}
