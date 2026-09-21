import "server-only";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import { UserRole } from "@/generated/prisma/client";
import { loginSchema } from "@/lib/auth-schema";
import { prisma } from "@/lib/prisma";
import "@/lib/env";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

class RateLimitedSignIn extends CredentialsSignin { code = "rate_limited"; }

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      authorize: async (credentials, request) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const [ipLimit, accountLimit] = await Promise.all([
          checkRateLimit("login-ip", rateLimitKey(request, "login-ip")),
          checkRateLimit("login-account", rateLimitKey(request, "login-account", parsed.data.email)),
        ]);
        if (!ipLimit.allowed || !accountLimit.allowed) throw new RateLimitedSignIn();

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user?.passwordHash) return null;
        if (!await bcrypt.compare(parsed.data.password, user.passwordHash)) return null;

        return { id: user.id, email: user.email, name: user.firstName ?? user.name ?? user.email, image: user.image, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? UserRole.USER;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) session.user.id = String(token.id);
      if (session.user) session.user.role = token.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER;
      return session;
    },
  },
});
