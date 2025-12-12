"use server";

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "No form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const mime = file.type || "";
  if (!ALLOWED_MIMES.has(mime)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 415 });
  }

  const size = typeof file.size === "number" ? file.size : 0;
  if (size > MAX_UPLOAD_SIZE) {
    return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 413 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  if (buffer.byteLength > MAX_UPLOAD_SIZE) {
    return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 413 });
  }

  try {
    const optimized = await sharp(buffer)
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const uploadDir = path.join(process.cwd(), "storage", "uploads");
    const publicDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(publicDir, { recursive: true });
    const safeName = `${Date.now()}-${randomUUID()}.webp`;
    const filePath = path.join(uploadDir, safeName);
    const publicPath = path.join(publicDir, safeName);

    await fs.writeFile(filePath, optimized);
    await fs.writeFile(publicPath, optimized);

    return NextResponse.json({
      ok: true,
      fileId: safeName,
      path: path.join("storage", "uploads", safeName),
      url: `/uploads/${encodeURIComponent(safeName)}`
    });
  } catch (error) {
    console.error("image upload failed", error);
    return NextResponse.json({ error: "No se pudo convertir la imagen" }, { status: 500 });
  }
}
