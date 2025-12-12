import { authOptions } from "./auth";
import { getServerSession } from "next-auth";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Sesión requerida");
  }
  return session;
}

export async function getSessionUser() {
  return (await getServerSession(authOptions))?.user;
}
