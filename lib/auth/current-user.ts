import "server-only";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export interface CurrentUser {
  id: string;
  role: Role;
  name: string | null;
  email: string | null;
}

/**
 * Per-request memoized current-user lookup (a small DAL). `React.cache`
 * dedupes the getServerSession + DB read across nested layouts within a
 * single request, so the operator group layout and a child layout (e.g.
 * admin) no longer issue two separate role queries per request.
 *
 * Role is read fresh from the DB and keyed by the stable user id, so a role
 * change takes effect without forcing the user to re-login, and we avoid the
 * earlier inconsistency where some callers keyed the lookup by email.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, name: true, email: true },
  });

  return user;
});
