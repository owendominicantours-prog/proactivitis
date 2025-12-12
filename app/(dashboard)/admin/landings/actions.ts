import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function saveLandingPageAction(formData: FormData) {
  "use server";
  const slug = formData.get("slug")?.toString() ?? "sample";
  const title = formData.get("title")?.toString() ?? "Landing";
  const body = formData.get("body")?.toString() ?? "";
  await prisma.landingPage.upsert({
    where: { slug },
    update: { title, body },
    create: { id: randomUUID(), slug, title, body, updatedAt: new Date() }
  });
  return { success: true };
}
