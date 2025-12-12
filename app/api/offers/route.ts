import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    offers: [
      { id: "off-1", title: "10% OFF Saona", active: true },
      { id: "off-2", title: "Día extra de buggy", active: true }
    ]
  });
}
