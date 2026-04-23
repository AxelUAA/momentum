import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");
  if (!isDashboardRoute) return NextResponse.next();

  const session = req.auth;
  if (!session) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/403", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Ejecutar middleware solo en rutas relevantes.
     * Excluye: /api, /_next, archivos estáticos (con extensión).
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.).*)",
  ],
};
