import { NextResponse } from "next/server";
import { landingPages } from "@/lib/landing";

export async function GET() {
  return NextResponse.json({ landings: landingPages });
}
