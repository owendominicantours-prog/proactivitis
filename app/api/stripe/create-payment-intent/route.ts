import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { amount } = await request.json().catch(() => ({ amount: 0 }));
  return NextResponse.json({
    clientSecret: "pi_client_secret_sample",
    amount: Number(amount) || 0
  });
}
