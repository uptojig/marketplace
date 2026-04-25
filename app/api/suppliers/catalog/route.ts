import { NextResponse } from "next/server";
import { Supplier } from "@prisma/client";
import { getSupplier } from "@/lib/suppliers/registry";

function parseNum(v: string | null): number | undefined {
  if (v === null || v === "") return undefined;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const supplierName = (url.searchParams.get("supplier") ?? "MOCK").toUpperCase() as Supplier;
  const search = url.searchParams.get("q") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20", 10);
  const minPriceTHB = parseNum(url.searchParams.get("minPrice"));
  const maxPriceTHB = parseNum(url.searchParams.get("maxPrice"));

  if (!Object.values(Supplier).includes(supplierName)) {
    return NextResponse.json({ error: `Unknown supplier: ${supplierName}` }, { status: 400 });
  }

  try {
    const adapter = getSupplier(supplierName);
    const result = await adapter.listCatalog({
      search,
      category,
      page,
      pageSize,
      minPriceTHB,
      maxPriceTHB,
    });
    return NextResponse.json({ supplier: supplierName, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        supplier: supplierName,
        error: err instanceof Error ? err.message : "Catalog fetch failed",
      },
      { status: 502 },
    );
  }
}
