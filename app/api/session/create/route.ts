import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return false;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (refererOrigin !== request.nextUrl.origin) return false;
    } catch {
      return false;
    }
  }

  return !!origin || !!referer;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "CSRF detectado" }, { status: 403 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Configuración faltante" }, { status: 500 });
  }

  const payload = await request.json().catch(() => null);
  const token = payload?.token;

  if (!token) {
    return NextResponse.json({ ok: false, error: "Token ausente" }, { status: 400 });
  }

  let decoded: JwtPayload | string;
  try {
    decoded = jwt.verify(token, secret);
  } catch {
    return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 401 });
  }

  const maxAge = 60 * 60 * 24 * 7;
  const secureFlag = process.env.NODE_ENV === "production" ? "Secure" : "";
  const cookieValue = [
    `auth_token=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    secureFlag
  ]
    .filter(Boolean)
    .join("; ");

  const response = NextResponse.json({ ok: true, sub: (decoded as JwtPayload)?.sub ?? null });
  response.headers.set("Set-Cookie", cookieValue);
  return response;
}
