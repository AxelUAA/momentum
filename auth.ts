import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "USER";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      } else if (token.sub) {
        // Refresh role from DB. Si el user ya no existe (db push / reset),
        // limpiamos los campos para que requireUser/Admin falle limpio en el próximo
        // request en lugar de apuntar a un id fantasma.
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        if (dbUser) {
          token.id = token.sub;
          token.role = dbUser.role;
        } else {
          delete token.id;
          delete token.role;
        }
      }
      return token;
    },
  },
});
