import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResolveDomain({
  searchParams,
}: {
  searchParams: { host?: string; path?: string };
}) {
  const host = (searchParams.host ?? "").toLowerCase();
  const path = searchParams.path ?? "/";
  if (!host) notFound();

  const store = await prisma.store.findUnique({ where: { customDomain: host } });
  if (!store) notFound();

  const dest = path === "/" ? `/stores/${store.slug}` : `/stores/${store.slug}${path}`;
  redirect(dest);
}
