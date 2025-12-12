import Stripe from "stripe";

let cached: { client: Stripe } | null = null;

export function getStripe() {
  if (cached) {
    return cached.client;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY no está configurada");
  }

  const client = new Stripe(secret, {
    apiVersion: "2023-08-16"
  });

  cached = { client };
  return client;
}
