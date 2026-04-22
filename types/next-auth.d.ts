import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extiende la interfaz Session para incluir user.id
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
