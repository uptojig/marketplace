import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin user CRUD root.
 *
 *   POST /api/admin/users
 *     body: { email, name?, role }
 *     - Creates a new User row directly. NextAuth will link this to
 *       any matching OAuth account on first sign-in (we already
 *       allow `allowDangerousEmailAccountLinking` for Google).
 *     - The invitee receives no automated email — admin shares the
 *       sign-in URL out-of-band, or the invitee uses the email
 *       magic-link flow on /signin once their email is in the DB.
 *     - Returns 409 if email is already in use; admin should edit
 *       the existing user's role instead.
 */

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, role: true },
  });
  return me?.role === "ADMIN" ? me : null;
}

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(["CUSTOMER", "VENDOR", "ADMIN"]),
  // Optional initial password — admin can set one so the new user
  // can sign in immediately via /signin (CredentialsProvider). If
  // omitted, the user is restricted to OAuth / magic-link.
  password: z.string().min(8).max(200).optional(),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { email, name, role, password } = parsed.data;
  const passwordHash = password ? await bcrypt.hash(password, 12) : null;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        role,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (e) {
    // P2002 = unique constraint failed. Email is the only unique
    // field on User, so this is always "email already in use".
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "email_already_in_use",
          detail:
            "This email is already registered. Edit the existing user's role instead of creating a new account.",
        },
        { status: 409 },
      );
    }
    throw e;
  }
}
