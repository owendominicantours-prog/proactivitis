import { NextResponse } from "next/server";
import { sampleNotifications } from "@/lib/notifications";

export async function GET() {
  return NextResponse.json({ notifications: sampleNotifications });
}
