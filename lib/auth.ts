import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Safe with Google: emails are verified by Google itself.
      // Lets users created via cookie-onboarding upgrade to Google sign-in.
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  );
}

// Emails that are auto-promoted to ADMIN on sign-in (comma-separated in env)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "database" },
  providers,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string; role?: Role }).id = user.id;
        (session.user as { id?: string; role?: Role }).role =
          (user as unknown as { role: Role }).role;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Auto-promote admin emails on every sign-in
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
          select: { role: true },
        });
        if (existing && existing.role !== "ADMIN") {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: "ADMIN" },
          });
          console.log(`[auth] Auto-promoted ${user.email} to ADMIN`);
        }
      }
    },
  },
  pages: {
    signIn: "/signin",
  },
};
