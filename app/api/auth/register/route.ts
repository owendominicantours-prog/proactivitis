"use server";

import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendResendEmail } from "@/lib/resend";

const SALT_ROUNDS = 12;

// Puedes definir esto en tu .env
// NEXT_PUBLIC_APP_URL=https://proactivitis.com
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "https://proactivitis.com";

const EMAIL_LOGO_URL = `${APP_BASE_URL}/logo.png`;

type RegisterBody = {
  email?: string;
  password?: string;
  name?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as RegisterBody;
    const rawEmail = body.email?.toString().trim() ?? "";
    const rawPassword = body.password?.toString() ?? "";
    const rawName = body.name?.toString().trim() ?? "";

    if (!rawEmail || !rawPassword) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      return NextResponse.json({ error: "El correo no parece válido" }, { status: 400 });
    }

    if (rawPassword.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    const normalizedEmail = rawEmail.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ese correo ya tiene una cuenta registrada" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(rawPassword, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: rawName || null,
        email: normalizedEmail,
        password: hashed,
        role: "CUSTOMER",
        supplierApproved: false,
        accountStatus: "APPROVED"
      }
    });

    const recommendedTours = await prisma.tour.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        title: true,
        price: true,
        slug: true,
        location: true
      }
    });

    const tourHtml = recommendedTours
      .map(
        (tour) => `
          <tr>
            <td style="padding: 8px 0;">
              <a href="${APP_BASE_URL}/tours/${tour.slug}" style="font-weight:600; color:#0ea5e9; text-decoration:none;">
                ${tour.title}
              </a>
              <p style="margin:4px 0 0;font-size:13px;color:#475569;">
                ${tour.location} · USD ${tour.price.toFixed(0)}
              </p>
            </td>
          </tr>
        `
      )
      .join("");

    const benefitsHtml = [
      { icon: "🔒", label: "Proveedores verificados" },
      { icon: "⚡", label: "Confirmación instantánea" },
      { icon: "🎧", label: "Soporte 24/7 en tu idioma" },
      { icon: "💰", label: "Mejor precio garantizado" }
    ]
      .map(
        (item) => `
          <tr>
            <td style="padding:6px 10px;">
              <span style="font-size:18px;margin-right:6px;">${item.icon}</span>
              <span style="font-size:14px;font-weight:600;color:#0f172a;">${item.label}</span>
            </td>
          </tr>
        `
      )
      .join("");

    const htmlBody = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#0f172a;background:#ecf2ff;padding:32px;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:30px;overflow:hidden;box-shadow:0 30px 90px rgba(2,6,23,0.15);">
          
          <!-- HEADER -->
          <div
            style="background:linear-gradient(135deg,#0096ff,#0074d9);padding:28px 28px 34px;display:flex;flex-direction:column;align-items:center;gap:12px;"
          >
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:28px;">🐬</span>
              <div style="color:#f8fbff;font-weight:600;letter-spacing:0.08em;font-size:12px;text-transform:uppercase;">
                Nuevas experiencias
              </div>
            </div>
            <div style="display:flex;align-items:center;">
              <img
                src="${EMAIL_LOGO_URL}"
                alt="Proactivitis"
                width="320"
                height="120"
                style="display:block;height:auto;filter:brightness(0) invert(1);"
              />
            </div>
          </div>

          <!-- BODY -->
          <div style="padding:32px 40px 28px;line-height:1.7;">
            <p style="margin:0 0 4px;font-size:16px;">Hola ${rawName || "viajero"},</p>
            <h1 style="font-size:26px;margin:8px 0 16px;font-weight:600;color:#0f172a;">
              Gracias por unirte a Proactivitis.
            </h1>
            <p style="margin:0;font-size:16px;color:#475569;">
              Desde hoy tienes acceso a experiencias auténticas, seguras y verificadas, con confirmación instantánea y atención 24/7 en tu idioma.
            </p>
            <p style="margin:12px 0 24px;font-size:15px;color:#475569;">
              🎯 Muy pronto recibirás recomendaciones diseñadas especialmente para ti según tus intereses y destinos.
            </p>

            <!-- BENEFICIOS -->
            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              style="width:100%;margin-bottom:28px;background:#f8fafc;border-radius:20px;padding:16px 12px;"
            >
              ${benefitsHtml}
            </table>

            <!-- RECOMENDACIONES -->
            <div style="background:#f0f9ff;padding:20px 22px;border-radius:20px;margin-bottom:28px;">
              <p style="margin:0 0 8px;font-weight:600;color:#0f172a;">Recomendaciones para ti</p>
              <p style="margin:0 0 12px;font-size:14px;color:#475569;">
                ${
                  recommendedTours.length
                    ? "Estos son algunos tours destacados que pronto podrás ver en tu cuenta:"
                    : "Estamos preparando experiencias increíbles. Muy pronto verás sugerencias personalizadas en tu cuenta."
                }
              </p>
              <table style="width:100%;border-collapse:collapse;">
                ${
                  tourHtml ||
                  `<tr><td style="font-size:13px;color:#64748b;padding-top:4px;">
                    Aún no hay tours publicados, pero pronto tendrás recomendaciones exclusivas.
                  </td></tr>`
                }
              </table>
            </div>

            <!-- CTA -->
            <a
              href="${APP_BASE_URL}/tours"
              style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:#006bff;color:#ffffff;border-radius:16px;font-weight:600;font-size:15px;text-decoration:none;box-shadow:0 10px 30px rgba(0,107,255,0.25);"
            >
              Descubre tu próxima aventura
            </a>
          </div>

          <!-- FOOTER -->
          <div style="padding:20px 40px 26px;font-size:12px;color:#94a3b8;background:#f8fafc;text-align:center;">
            <p style="margin:0 0 6px;">Proactivitis LLC · Miami, FL · support@proactivitis.com</p>
            <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">
              Gestión de privacidad · Cancelar notificaciones
            </p>
            <p style="margin:8px 0 0;">
              ID de cuenta: <strong>${user.id}</strong>
            </p>
          </div>
        </div>
      </div>
    `;

    await sendResendEmail({
      to: normalizedEmail,
      subject: "Tu cuenta en Proactivitis está lista",
      html: htmlBody
    }).catch((err) => {
      console.warn(
        "No se pudo enviar el email de bienvenida a",
        normalizedEmail,
        err?.message ?? err
      );
    });

    return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Register error", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error interno creando la cuenta";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
