import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { userService } from "@ruach/database";

/**
 * Credentials provider + JWT session strategy -- no Prisma adapter. NextAuth's own
 * docs note database sessions don't apply to Credentials-based auth, so a Prisma
 * adapter would add Account/Session/VerificationToken tables with no benefit here.
 * This is the one documented deviation from the original "Credentials + Prisma
 * adapter" plan note -- functionally equivalent, simpler, and matches NextAuth's own
 * constraint. Chosen specifically because it needs no external account or API key,
 * satisfying brief §57's "runs without production credentials."
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : undefined;
        const password = typeof credentials?.password === "string" ? credentials.password : undefined;
        if (!email || !password) return null;

        const user = await userService.findUserByEmail(email);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) token.userId = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && typeof token.userId === "string") {
        session.user.id = token.userId;
      }
      return session;
    },
  },
});
