import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Safe with Google: emails are verified by Google itself.
      // Lets pre-existing User rows (e.g. seeded admin accounts) link
      // to a Google sign-in on first login without erroring.
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

// EMAIL_SERVER is parsed for its password (Resend's SMTP password
// IS the API key) so we can drive Resend's HTTPS /emails endpoint
// instead of nodemailer SMTP. DigitalOcean blocks outbound :465/:587
// on shop droplets by default, so SMTP times out; the HTTPS API on
// :443 is always reachable.
function extractResendApiKey(): string | null {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  const url = process.env.EMAIL_SERVER;
  if (!url) return null;
  // Form: smtp://<user>:<password>@host:port  — password is the API key.
  const m = url.match(/^smtps?:\/\/[^:]+:([^@]+)@/);
  return m?.[1] ?? null;
}

const resendApiKey = extractResendApiKey();

if (resendApiKey && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      // server/from are required by NextAuth's type but ignored when
      // we override sendVerificationRequest. Keep server set so any
      // future code reading provider.options.server still works.
      server: process.env.EMAIL_SERVER ?? "",
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: to, url, provider }) {
        const from = provider.from;
        const subject = `เข้าสู่ระบบ ${new URL(url).host}`;
        const html = `
          <p>คลิกลิงก์ด้านล่างเพื่อเข้าสู่ระบบ (ลิงก์มีอายุ 24 ชั่วโมง):</p>
          <p><a href="${url}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:8px;font-family:system-ui,sans-serif">เข้าสู่ระบบ</a></p>
          <p style="font-size:12px;color:#666">หรือคัดลอกลิงก์: <br>${url}</p>
        `;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from, to, subject, html }),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new Error(`Resend send failed: ${res.status} ${body.slice(0, 200)}`);
        }
      },
    }),
  );
}

// Username/password (CredentialsProvider). Always enabled — no env gate
// because the only requirement is that target users have a passwordHash
// set on their User row. Demo accounts seeded by
// scripts/create-demo-accounts.mjs ship with a hash; admin can also set
// an initial password when creating a user from /admin/users.
//
// Caveat: Credentials sessions are JWT-based by NextAuth design (the
// PrismaAdapter `database` strategy doesn't support credentials). We
// keep the existing `session: { strategy: "database" }` for OAuth +
// email-link flows, and let the credentials path silently fall back
// to JWT for those sessions. The `session({ session, user })` callback
// below already tolerates either shape.
providers.push(
  CredentialsProvider({
    id: "credentials",
    name: "Email + Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(creds) {
      const email = creds?.email?.trim().toLowerCase();
      const password = creds?.password ?? "";
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          passwordHash: true,
        },
      });
      if (!user || !user.passwordHash) {
        // Either the email isn't registered, or the user only has
        // OAuth/magic-link configured. Same null response either
        // way so we don't reveal which case it is.
        return null;
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return null;

      // Return the shape NextAuth expects. The session callback
      // below normalises role onto session.user.
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      } as { id: string; email: string | null; name: string | null; image: string | null; role: Role };
    },
  }),
);

// Emails that are auto-promoted to ADMIN on sign-in (comma-separated in env)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  // JWT strategy is required for CredentialsProvider — the Prisma
  // adapter's database strategy can't store credential sessions.
  // OAuth + email-link still work fine on JWT (NextAuth backs them
  // with the JWT) and we still get DB-side User/Account rows via
  // the adapter; we just don't read sessions from the DB.
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    // JWT runs first on every request — bake `id` and `role` into
    // the token so we can hand them to the session callback.
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in: `user` is whatever the provider returned
        // (CredentialsProvider.authorize result OR adapter user row).
        const u = user as { id?: string; role?: Role };
        if (u.id) token.userId = u.id;
        if (u.role) token.role = u.role;
      }
      // Subsequent calls only have `token` — the data was baked in
      // above on the initial sign-in. Re-fetch role from DB on every
      // request would be more robust, but we'd pay a query per
      // request; rely on /admin/users role-change forcing a re-login
      // to pick up updates.
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as { userId?: string; role?: Role };
        (session.user as { id?: string; role?: Role }).id = t.userId;
        (session.user as { id?: string; role?: Role }).role = t.role;
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
