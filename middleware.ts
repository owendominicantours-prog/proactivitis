import { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

const roleRoutes = [
  { base: "/admin", roles: ["ADMIN"] },
  { base: "/supplier", roles: ["SUPPLIER"] },
  { base: "/agency", roles: ["AGENCY"] },
  { base: "/customer", roles: ["CUSTOMER"] },
  { base: "/me", roles: ["CUSTOMER"] },
  { base: "/chat", roles: ["ADMIN", "SUPPLIER", "AGENCY", "CUSTOMER"] },
  { base: "/portal/admin", roles: ["ADMIN"] },
  { base: "/portal/supplier", roles: ["SUPPLIER"] },
  { base: "/portal/agency", roles: ["AGENCY"] },
  { base: "/portal/customer", roles: ["CUSTOMER"] }
];

function matchAllowed(pathname: string, role?: string) {
  const normalized = pathname.toLowerCase();
  const match = roleRoutes.find((item) => normalized.startsWith(item.base));
  if (!match) return true;
  if (!role) return false;
  return match.roles.includes(role);
}

export default withAuth(
  () => {},
  {
    callbacks: {
      authorized({ token, req }) {
        return matchAllowed(req.nextUrl.pathname, token?.role as string);
      }
    }
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/supplier/:path*",
    "/agency/:path*",
    "/customer/:path*",
    "/me/:path*",
    "/chat",
    "/portal/(admin|supplier|agency|customer)"
  ]
};
