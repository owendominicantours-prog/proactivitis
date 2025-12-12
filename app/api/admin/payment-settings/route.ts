import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    currency: "USD",
    payoutWindow: [5, 20],
    paymentProviders: ["Stripe", "PayPal"]
  });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  return NextResponse.json({ saved: true, payload });
}
