import { NextResponse } from "next/server";
import { Supplier } from "@prisma/client";
import { getSupplier } from "@/lib/suppliers/registry";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const supplierName = (url.searchParams.get("supplier") ?? "MOCK").toUpperCase() as Supplier;
  if (!Object.values(Supplier).includes(supplierName)) {
    return NextResponse.json({ error: `Unknown supplier: ${supplierName}` }, { status: 400 });
  }
  try {
    const adapter = getSupplier(supplierName);
    const categories = await adapter.categories();
    return NextResponse.json({ supplier: supplierName, categories });
  } catch (err) {
    return NextResponse.json(
      {
        supplier: supplierName,
        error: err instanceof Error ? err.message : "Categories fetch failed",
      },
      { status: 502 },
    );
  }
}
