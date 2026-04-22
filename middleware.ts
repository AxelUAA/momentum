import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Si la ruta empieza con /dashboard y no hay sesión, redirigir a /login
  if (pathname.startsWith("/dashboard") && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
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
