import "server-only";

import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const STRIPE_PRICES = {
  invitacionPro: process.env.STRIPE_PRICE_INVITACION_PRO,
  invitacionPremium: process.env.STRIPE_PRICE_INVITACION_PREMIUM,
  organizadorPlus: process.env.STRIPE_PRICE_ORGANIZADOR_PLUS,
  organizadorPro: process.env.STRIPE_PRICE_ORGANIZADOR_PRO,
};