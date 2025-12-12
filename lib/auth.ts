import bcrypt from "bcrypt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import type { NextAuthOptions } from "next-auth";

const roleRedirects: Record<string, string> = {
  ADMIN: "/portal/admin",
  SUPPLIER: "/portal/supplier",
  AGENCY: "/portal/agency",
  CUSTOMER: "/portal/customer"
};

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  console.warn("NEXTAUTH_SECRET no está definido; configura un valor seguro en despliegue.");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: secret ?? "dev-secret",
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        if (!user || !user.password) return null;
        const validPassword = await bcrypt.compare(credentials.password, user.password);
        if (!validPassword) {
          return null;
        }
        const needsApproval = ["SUPPLIER", "AGENCY"].includes(user.role ?? "");
        if (needsApproval && user.accountStatus !== "APPROVED") {
          const defaultMessage =
            user.accountStatus === "REJECTED"
              ? "Su cuenta ha sido rechazada. Revisa tu correo para más detalles."
              : "Tu cuenta aún no ha sido aprobada.";
          throw new Error(user.statusMessage ?? defaultMessage);
        }
        return user;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (!session?.user) return session;
      session.user.id = token.sub;
      session.user.role = token.role as string;
      session.user.supplierApproved = token.supplierApproved === "true";
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
        token.supplierApproved = (user as { supplierApproved?: boolean }).supplierApproved
          ? "true"
          : "false";
      }
      return token;
    },
    async redirect({ url, baseUrl, token }) {
      if (!token?.role) return baseUrl;
      const mapped = roleRedirects[token.role as string];
      return mapped ?? url ?? baseUrl;
    }
  },
  pages: {
    signIn: "/auth/login"
  }
};
