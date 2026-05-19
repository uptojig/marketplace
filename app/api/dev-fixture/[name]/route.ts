// Dev-only static fixture server for the in-browser KYC benchmark.
// Serves test images from C:/Users/riwki/Downloads/Archive/{Test1,} so
// chrome-devtools evaluate_script can build FormData on the browser side
// without dragging in 2MB of base64 per fixture. Gated to development +
// localhost — refuses to run in production OR over non-loopback origins.
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIXTURE_ROOTS: Record<string, string> = {
  test1: "C:/Users/riwki/Downloads/Archive/Test1",
  archive: "C:/Users/riwki/Downloads/Archive",
};

function mimeFor(name: string): string {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  return ext === "png" ? "image/png" : "image/jpeg";
}

export async function GET(req: Request, { params }: { params: { name: string } }) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "disabled in production" }, { status: 403 });
  }
  const host = req.headers.get("host") ?? "";
  if (!host.startsWith("localhost") && !host.startsWith("127.0.0.1")) {
    return NextResponse.json({ error: "loopback only" }, { status: 403 });
  }
  const url = new URL(req.url);
  const set = url.searchParams.get("set") ?? "test1";
  const root = FIXTURE_ROOTS[set];
  if (!root) return NextResponse.json({ error: `unknown set: ${set}` }, { status: 400 });
  const safeName = params.name.replace(/[^A-Za-z0-9._-]/g, "");
  if (!safeName) return NextResponse.json({ error: "bad name" }, { status: 400 });

  try {
    const buffer = await readFile(join(root, safeName));
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "content-type": mimeFor(safeName),
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: `not found: ${safeName}`, root }, { status: 404 });
  }
}
