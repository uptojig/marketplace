'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, FolderPlus, Package, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MarketplacePage } from '@/components/layout/marketplace-page';
import {
  useCollectionStore,
  COLLECTION_STATUS_LABEL,
} from '@/lib/import-collections/store';

export default function CollectionsListPage() {
  const collections = useCollectionStore((s) => s.collections);
  const deleteCollection = useCollectionStore((s) => s.deleteCollection);

  return (
    <MarketplacePage>
      <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
        <Link
          href="/seller/import"
          className="mb-2 inline-flex items-center text-xs text-muted-foreground hover:underline"
        >
          <ChevronLeft className="h-3 w-3" /> กลับไปค้นหา
        </Link>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold lg:text-2xl">คอลเลคชั่นนำเข้า</h1>
            <p className="text-xs text-muted-foreground">
              กลุ่มสินค้าที่เตรียมไว้ — แปลทั้งกลุ่ม จัด category อัตโนมัติ เลือกภาพหลัก ก่อนยืนยันนำเข้า
            </p>
          </div>
        </div>

        {collections.length === 0 ? (
          <Card className="flex flex-col items-center py-16 text-center">
            <FolderPlus className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              ยังไม่มีคอลเลคชั่น ไปค้นหาสินค้าแล้วกด "เพิ่มในคอลเลคชั่น"
            </p>
            <Button asChild className="mt-4">
              <Link href="/seller/import">ไปค้นหาสินค้า</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => {
              const previewImages = c.items.slice(0, 4).map((i) => i.product.primaryImage);
              const translatedCount = c.items.filter((i) => i.translated).length;
              const rejectedCount = c.items.filter((i) => i.product.ipVerdict === 'REJECTED').length;
              return (
                <Card key={c.id} className="overflow-hidden">
                  <Link href={`/seller/import/collections/${c.id}`}>
                    <div className="grid aspect-[5/2] grid-cols-4 gap-px bg-muted">
                      {previewImages.map((src, i) => (
                        <div key={i} className="relative">
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 120px, 33vw"
                          />
                        </div>
                      ))}
                      {[...Array(Math.max(0, 4 - previewImages.length))].map((_, i) => (
                        <div key={`empty-${i}`} className="bg-muted" />
                      ))}
                    </div>
                  </Link>
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      <Link
                        href={`/seller/import/collections/${c.id}`}
                        className="min-w-0 flex-1"
                      >
                        <h3 className="line-clamp-1 text-sm font-medium hover:underline">
                          {c.name}
                        </h3>
                      </Link>
                      <StatusPill status={c.status} />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>
                        <Package className="mr-0.5 inline h-3 w-3" />
                        {c.items.length} รายการ
                      </span>
                      {translatedCount > 0 && (
                        <span className="text-blue-600">{translatedCount} แปลแล้ว</span>
                      )}
                      {rejectedCount > 0 && (
                        <span className="text-red-600">{rejectedCount} ถูกปฏิเสธ</span>
                      )}
                    </div>
                    {c.targetStoreId && (
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        ปลายทาง: ร้าน <span className="font-medium">{c.targetStoreId}</span>
                      </div>
                    )}
                    <div className="mt-2 flex gap-2">
                      <Button asChild size="sm" className="h-7 flex-1 text-[11px]">
                        <Link href={`/seller/import/collections/${c.id}`}>เปิดดู</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => confirm(`ลบ "${c.name}"?`) && deleteCollection(c.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MarketplacePage>
  );
}

function StatusPill({ status }: { status: keyof typeof COLLECTION_STATUS_LABEL }) {
  const cls =
    status === 'imported'
      ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-200'
      : status === 'ready'
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200'
        : status === 'processing'
          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
          : 'bg-muted text-muted-foreground';
  return (
    <Badge variant="outline" className={`shrink-0 border-0 text-[9px] ${cls}`}>
      {COLLECTION_STATUS_LABEL[status]}
    </Badge>
  );
}
