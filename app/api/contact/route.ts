import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/notificationService";

const sanitizeField = (value: FormDataEntryValue | null): string => {
  return typeof value === "string" ? value.trim() : "";
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = sanitizeField(formData.get("name"));
  const email = sanitizeField(formData.get("email"));
  const topic = sanitizeField(formData.get("topic"));
  const bookingCode = sanitizeField(formData.get("bookingCode"));
  const message = sanitizeField(formData.get("message"));

  if (!name || !email || !topic || !message) {
    return NextResponse.json({ error: "Completa todos los campos obligatorios." }, { status: 400 });
  }

  const summary = `${name} • ${email}${bookingCode ? ` • Reserva ${bookingCode}` : ""}`;
  await createNotification({
    type: "ADMIN_CONTACT_REQUEST",
    role: "ADMIN",
    title: `Contacto: ${topic}`,
    message,
    metadata: {
      name,
      email,
      topic,
      bookingCode: bookingCode || null,
      summary
    }
  });

  return NextResponse.json({ success: true });
}
