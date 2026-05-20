import { prisma } from "../lib/prisma";

async function main() {
  const tables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  const has = tables.find((t) => t.table_name === "StoreLandingContent");
  console.log("StoreLandingContent exists:", !!has);
  console.log("All tables:", tables.map((t) => t.table_name).join(", "));

  const migs = await prisma.$queryRaw<
    { migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }[]
  >`
    SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations
    ORDER BY started_at DESC LIMIT 8;
  `;
  console.log("\nRecent migrations:");
  for (const m of migs) {
    const status = m.rolled_back_at
      ? "ROLLED BACK"
      : m.finished_at
        ? "DONE"
        : "PENDING";
    console.log(" -", m.migration_name, status);
  }
}
main().finally(() => prisma.$disconnect());
