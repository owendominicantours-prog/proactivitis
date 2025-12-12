import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(_: Request, { params }: { params: { fileId: string } }) {
  const { fileId } = params;
  console.log("GET /api/uploaded -> fileId", fileId);
  if (!fileId) {
    return NextResponse.json({ error: "Archivo no especificado" }, { status: 400 });
  }
  const filePath = path.join(process.cwd(), "storage", "uploads", fileId);
  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(fileId).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".webp") {
      contentType = "image/webp";
    }
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString()
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
