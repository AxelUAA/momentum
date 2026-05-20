import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

import { sendClientWelcomeEmail } from "@/lib/email-senders";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.email) {
        try {
          await sendClientWelcomeEmail({
            clientEmail: user.email,
            clientName: user.name || "Organizador",
            planName: "Momentum",
            amountCents: null, // "—" -> Mensaje genérico de bienvenida
            clientToken: "dashboard",
          });
        } catch (e) {
          console.error("Error enviando email de bienvenida al nuevo usuario:", e);
        }
      }
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "USER";
        session.user.stripeCustomerId = token.stripeCustomerId as string | undefined;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.stripeCustomerId = (user as any).stripeCustomerId ?? undefined;
      }
      return token;
    },
  },
});
