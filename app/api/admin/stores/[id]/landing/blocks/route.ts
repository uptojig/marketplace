import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiFixBlock } from "@/lib/block-editor-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Block = { blockType: string; content: Record<string, unknown> };
type Page = { slug: string; isHomepage?: boolean; blocks: Block[] };
type V12Schema = {
  schemaVersion: string;
  designFamily?: string;
  metadata?: Record<string, unknown>;
  globalHeader?: Record<string, unknown>;
  globalFooter?: Record<string, unknown>;
  pages: Page[];
};

const blockSchema = z.object({
  blockType: z.string().min(1),
  content: z.record(z.string(), z.unknown()).default({}),
});

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("updateBlock"),
    pageIndex: z.number().int().min(0),
    blockIndex: z.number().int().min(0),
    block: blockSchema,
  }),
  z.object({
    action: z.literal("moveBlock"),
    pageIndex: z.number().int().min(0),
    blockIndex: z.number().int().min(0),
    direction: z.enum(["up", "down"]),
  }),
  z.object({
    action: z.literal("deleteBlock"),
    pageIndex: z.number().int().min(0),
    blockIndex: z.number().int().min(0),
  }),
  z.object({
    action: z.literal("addBlock"),
    pageIndex: z.number().int().min(0),
    position: z.number().int().min(0),
    block: blockSchema,
  }),
  z.object({
    action: z.literal("aiFix"),
    pageIndex: z.number().int().min(0),
    blockIndex: z.number().int().min(0),
    instruction: z.string().min(1).max(2000),
  }),
]);

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

/** Normalize v11 (flat Block[]) or v12 schema to a V12Schema */
function toV12(raw: unknown): { schema: V12Schema; wasV11: boolean } {
  if (Array.isArray(raw)) {
    return {
      schema: {
        schemaVersion: "12",
        pages: [{ slug: "home", isHomepage: true, blocks: raw as Block[] }],
      },
      wasV11: true,
    };
  }
  if (raw && typeof raw === "object" && "pages" in raw) {
    return { schema: raw as V12Schema, wasV11: false };
  }
  throw new Error("landingBlocks is neither v11 array nor v12 schema");
}

/** Convert back to v11 if it was originally v11 */
function fromV12(schema: V12Schema, wasV11: boolean): unknown {
  if (wasV11 && schema.pages.length === 1) {
    return schema.pages[0].blocks;
  }
  return schema;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const action = parsed.data;

  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: { landingBlocks: true, name: true, landingThemeVariant: true },
  });
  if (!store || !store.landingBlocks) {
    return NextResponse.json({ error: "No landing blocks" }, { status: 404 });
  }

  let v12: V12Schema;
  let wasV11: boolean;
  try {
    ({ schema: v12, wasV11 } = toV12(store.landingBlocks));
  } catch {
    return NextResponse.json({ error: "Invalid schema format" }, { status: 500 });
  }

  const page = v12.pages[action.pageIndex];
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  switch (action.action) {
    case "updateBlock": {
      if (action.blockIndex >= page.blocks.length) {
        return NextResponse.json({ error: "Block not found" }, { status: 404 });
      }
      page.blocks[action.blockIndex] = action.block;
      break;
    }

    case "moveBlock": {
      const { blockIndex, direction } = action;
      if (blockIndex >= page.blocks.length) {
        return NextResponse.json({ error: "Block not found" }, { status: 404 });
      }
      const target = direction === "up" ? blockIndex - 1 : blockIndex + 1;
      if (target < 0 || target >= page.blocks.length) {
        return NextResponse.json({ error: "Cannot move further" }, { status: 400 });
      }
      [page.blocks[blockIndex], page.blocks[target]] = [
        page.blocks[target],
        page.blocks[blockIndex],
      ];
      break;
    }

    case "deleteBlock": {
      if (action.blockIndex >= page.blocks.length) {
        return NextResponse.json({ error: "Block not found" }, { status: 404 });
      }
      page.blocks.splice(action.blockIndex, 1);
      break;
    }

    case "addBlock": {
      const pos = Math.min(action.position, page.blocks.length);
      page.blocks.splice(pos, 0, action.block);
      break;
    }

    case "aiFix": {
      if (action.blockIndex >= page.blocks.length) {
        return NextResponse.json({ error: "Block not found" }, { status: 404 });
      }
      try {
        const fixed = await aiFixBlock({
          block: page.blocks[action.blockIndex],
          instruction: action.instruction,
          designFamily: v12.designFamily ?? store.landingThemeVariant ?? undefined,
          storeName: store.name,
        });
        page.blocks[action.blockIndex] = fixed;
      } catch (err) {
        return NextResponse.json(
          {
            error: "ai_fix_failed",
            detail: err instanceof Error ? err.message : "unknown",
          },
          { status: 500 },
        );
      }
      break;
    }
  }

  const saved = fromV12(v12, wasV11);
  await prisma.store.update({
    where: { id: params.id },
    data: { landingBlocks: saved as never },
  });

  return NextResponse.json({
    ok: true,
    action: action.action,
    page: { slug: page.slug, blocks: page.blocks },
  });
}
