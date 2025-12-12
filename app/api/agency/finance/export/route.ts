import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    export: "agency-finance",
    meta: "CSV disponible en /tmp/logs"
  });
}
