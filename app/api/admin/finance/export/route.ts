import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    export: "admin-finance",
    meta: "CSV snapshot en /tmp/logs"
  });
}
