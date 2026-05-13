import { NextResponse } from 'next/server';
import { getSupplierClient } from '@/lib/import-sources';
import type { ImportSource, SupplierSearchQuery } from '@/lib/import-sources/types';

/**
 * POST /api/import/search
 *
 * Body matches SupplierSearchQuery + thaiCategories[] for category filtering.
 */

export async function POST(request: Request) {
  let body: SupplierSearchQuery;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.source || body.keyword === undefined) {
    return NextResponse.json({ error: 'missing_required_fields' }, { status: 400 });
  }

  try {
    const client = getSupplierClient(body.source as ImportSource);
    const result = await client.search(body);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
