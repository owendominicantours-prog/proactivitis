import { mkdirSync, writeFileSync } from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createPartnerApplicationNotification } from "@/lib/notificationService";

const REQUIRED_FIELDS = [
  "role",
  "companyName",
  "contactName",
  "contactRole",
  "email",
  "phone",
  "country",
  "description",
  "serviceTypes"
];

const UPLOADS_DIRECTORY = path.join(process.cwd(), "public", "uploads", "partner-applications");

const sanitizeFileName = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .slice(0, 120);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const missing = REQUIRED_FIELDS.filter((field) => !body[field] || String(body[field]).trim() === "");

  if (missing.length) {
    return NextResponse.json(
      { error: `Faltan los campos requeridos: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const role = String(body.role).toUpperCase();
  const serviceTypes = Array.isArray(body.serviceTypes)
    ? body.serviceTypes.filter((value) => Boolean(value))
    : [];
  const normalizedEmail = String(body.email).toLowerCase().trim();
  const password = String(body.password ?? "").trim();
  const confirmPassword = String(body.confirmPassword ?? "").trim();

  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  if (confirmPassword && password !== confirmPassword) {
    return NextResponse.json({ error: "Las contraseñas no coinciden." }, { status: 400 });
  }

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  let documentUrl: string | null = null;
  let documentName: string | null = null;

  if (body.documentData && typeof body.documentName === "string") {
    documentName = body.documentName;
    try {
      const buffer = Buffer.from(body.documentData, "base64");
      mkdirSync(UPLOADS_DIRECTORY, { recursive: true });
      const extension = path.extname(documentName);
      const safeName = `${randomUUID()}${extension || ""}`;
      const fullName = `${safeName}`;
      const destinationPath = path.join(UPLOADS_DIRECTORY, fullName);
      writeFileSync(destinationPath, buffer);
      documentUrl = `/uploads/partner-applications/${fullName}`;
      documentName = sanitizeFileName(documentName);
    } catch (error) {
      console.error("No se pudo guardar el documento:", error);
    }
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const userData = {
    name: String(body.contactName),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    supplierApproved: role === "SUPPLIER" ? false : existingUser?.supplierApproved ?? false,
    agencyApproved: role === "AGENCY" ? false : existingUser?.agencyApproved ?? false,
    accountStatus: "PENDING",
    statusMessage: "Tu solicitud está siendo revisada por nuestro equipo."
  };

  const user =
    existingUser?.id != null
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: userData
        })
      : await prisma.user.create({
          data: {
            id: randomUUID(),
            ...userData
          }
        });

  const application = await prisma.partnerApplication.create({
    data: {
      role,
      companyName: String(body.companyName),
      contactName: String(body.contactName),
      contactRole: String(body.contactRole),
      email: String(body.email),
      phone: String(body.phone),
      country: String(body.country),
      website: body.website ? String(body.website) : null,
      serviceTypes: serviceTypes.join(", "),
      description: String(body.description),
      documentName,
      documentUrl,
      userId: user.id
    }
  });

  await createPartnerApplicationNotification({ applicationId: application.id, companyName: application.companyName });

  return NextResponse.json({ id: application.id }, { status: 201 });
}
