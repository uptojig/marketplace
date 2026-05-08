import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { sendEmail, isEmailConfigured } from "@/lib/email/send";

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

// Magic-link sign-in. Two backends supported:
//   - Resend (preferred) — set RESEND_API_KEY + RESEND_FROM
//   - SMTP (fallback)    — set EMAIL_SERVER + EMAIL_FROM
// EmailProvider's default uses nodemailer over EMAIL_SERVER. When
// RESEND_API_KEY is set we override sendVerificationRequest so the
// email goes through the Resend HTTPS API instead — works on Vercel
// edge/serverless without opening SMTP ports.
if (isEmailConfigured()) {
  providers.push(
    EmailProvider({
      // EmailProvider still expects these fields for type validation
      // even when sendVerificationRequest is overridden — pass dummy
      // strings so it doesn't try to construct a nodemailer transport.
      server: { host: "resend", port: 0, auth: { user: "", pass: "" } },
      from: process.env.RESEND_FROM ?? "noreply@example.com",
      async sendVerificationRequest({ identifier, url }) {
        const host = new URL(url).host;
        await sendEmail({
          to: identifier,
          subject: `เข้าสู่ระบบ ${host}`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
              <h2 style="margin:0 0 12px">เข้าสู่ระบบ</h2>
              <p>คลิกปุ่มด้านล่างเพื่อเข้าสู่ระบบ — ลิงก์มีอายุ 24 ชั่วโมง</p>
              <p style="margin:24px 0">
                <a href="${url}" style="background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">เข้าสู่ระบบ</a>
              </p>
              <p style="font-size:12px;color:#666">ถ้าปุ่มกดไม่ได้ ใช้ลิงก์นี้: <br><span style="word-break:break-all">${url}</span></p>
              <p style="font-size:12px;color:#666;margin-top:24px">หากคุณไม่ได้ขอลิงก์นี้ ละเลยอีเมลนี้ได้</p>
            </div>
          `,
          text: `เข้าสู่ระบบ: ${url}`,
        });
      },
    }),
  );
} else if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
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
