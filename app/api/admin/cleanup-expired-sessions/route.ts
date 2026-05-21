import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Terminal states — sessions in these states are finalized and should NOT be deleted
const TERMINAL_STATES = ["AUTO_APPROVED", "MANUAL_REVIEW", "REJECTED"];

/**
 * POST /api/admin/cleanup-expired-sessions
 *
 * Deletes wizard sessions that have expired AND are still in-progress.
 * Also clears User.dgaData for any associated users whose sessions failed.
 *
 * This can be called by a cron job or manually by an admin.
 */
export async function POST(req: Request) {
  try {
    const expectedSecret = process.env.CLEANUP_SECRET;
    if (!expectedSecret) {
      return NextResponse.json({ ok: false, error: "CLEANUP_SECRET is not configured on the server" }, { status: 500 });
    }

    const authHeader = req.headers.get("x-cleanup-secret");
    if (authHeader !== expectedSecret) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find expired sessions that are NOT in a terminal state
    const expiredSessions = await prisma.wizardSession.findMany({
      where: {
        expiresAt: { lt: now },
        state: { notIn: TERMINAL_STATES },
      },
      select: {
        id: true,
        userId: true,
        state: true,
      },
    });

    if (expiredSessions.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No expired sessions to clean up",
        deleted: 0,
      });
    }

    // Collect userIds that need dgaData cleared
    const userIdsToClean = expiredSessions
      .filter((s) => s.userId !== null)
      .map((s) => s.userId as string);

    // Delete expired sessions (cascade deletes evidence, DGA fields, OCR results, etc.)
    const deleteResult = await prisma.wizardSession.deleteMany({
      where: {
        id: { in: expiredSessions.map((s) => s.id) },
      },
    });

    // Clear dgaData for associated users
    let actualUsersCleaned = 0;
    if (userIdsToClean.length > 0) {
      const updateResult = await prisma.user.updateMany({
        where: {
          id: { in: userIdsToClean },
          // Only clear dgaData for users who don't have another successful session
          NOT: {
            kycSessions: {
              some: {
                state: { in: ["AUTO_APPROVED", "MANUAL_REVIEW"] },
              },
            },
          },
        },
        data: {
          dgaData: null as any,
        },
      });
      actualUsersCleaned = updateResult.count;
    }

    return NextResponse.json({
      ok: true,
      message: `Cleaned up ${deleteResult.count} expired session(s)`,
      deleted: deleteResult.count,
      usersCleaned: actualUsersCleaned,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
