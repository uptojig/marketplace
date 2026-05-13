'use client';

import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Edit3,
  Loader2,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { MarketplacePage } from '@/components/layout/marketplace-page';
import {
  confirmImport,
  getImportJob,
  type ImportJobResult,
} from '@/lib/import-jobs/actions';

const CATEGORY_LABELS: Record<string, string> = {
  brand_counterfeit: 'แบรนด์ปลอม',
  copyrighted_character: 'ลิขสิทธิ์การ์ตูน',
  regulated_substance: 'สินค้าควบคุม',
  weapon: 'อาวุธ',
  adult_content: 'เนื้อหาผู้ใหญ่',
  animal_welfare: 'สวัสดิภาพสัตว์',
  health_claim: 'อ้างผลทางสุขภาพ',
};

export default function ImportJobPage() {
  const router = useRouter();
  const params = useParams<{ jobId: string }>();
  const [job, setJob] = useState<ImportJobResult | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'accepted' | 'flagged' | 'rejected'>('accepted');
  const [pending, startTransition] = useTransition();
  const [imported, setImported] = useState<number | null>(null);

  useEffect(() => {
    if (!params.jobId) return;
    getImportJob(params.jobId).then((j) => {
      setJob(j);
      // Pre-select all accepted items
      if (j) {
        setSelectedItems(
          new Set(j.items.filter((i) => i.status === 'accepted').map((i) => i.id)),
        );
      }
    });
  }, [params.jobId]);

  if (!job) {
    return (
      <MarketplacePage>
        <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </MarketplacePage>
    );
  }

  const filteredItems = job.items.filter((i) => filter === 'all' || i.status === filter);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedItems.size === 0) return;
    startTransition(async () => {
      const result = await confirmImport({
        jobId: job.jobId,
        itemIds: Array.from(selectedItems),
        storeId: 'store_1', // TODO from session
      });
      if (result.ok) setImported(result.importedCount);
    });
  };

  if (imported !== null) {
    return (
      <MarketplacePage>
        <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
          <h1 className="mt-4 text-xl font-semibold">นำเข้าสำเร็จ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            นำเข้า {imported} รายการเข้าร้านของมึงแล้ว
          </p>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => router.push('/seller/import')}>
              นำเข้าเพิ่ม
            </Button>
            <Button onClick={() => router.push('/seller/products')}>
              ดูสินค้าในร้าน <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </MarketplacePage>
    );
  }

  return (
    <MarketplacePage>
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        <button
          onClick={() => router.back()}
          className="mb-2 inline-flex items-center text-xs text-muted-foreground hover:underline"
        >
          <ChevronLeft className="h-3 w-3" /> กลับไปค้นหา
        </button>
        <h1 className="text-xl font-semibold lg:text-2xl">ผลการประมวลผล</h1>
        <p className="text-xs text-muted-foreground font-mono">Job {job.jobId}</p>

        {/* Summary cards */}
        <div className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="ทั้งหมด"
            value={job.summary.total}
            color="default"
          />
          <SummaryCard
            label="ผ่าน"
            value={job.summary.accepted}
            color="green"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <SummaryCard
            label="ต้องตรวจสอบ"
            value={job.summary.flagged}
            color="amber"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <SummaryCard
            label="ปฏิเสธ"
            value={job.summary.rejected}
            color="red"
            icon={<XCircle className="h-4 w-4" />}
          />
        </div>

        {/* Rejection breakdown */}
        {Object.keys(job.summary.rejectionBreakdown).length > 0 && (
          <Card className="mb-4 p-4">
            <h3 className="mb-2 text-sm font-semibold">เหตุผลการปฏิเสธ</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(job.summary.rejectionBreakdown).map(([cat, count]) => (
                <Badge key={cat} variant="outline" className="font-normal">
                  {CATEGORY_LABELS[cat] ?? cat}:{' '}
                  <span className="ml-1 font-semibold">{count}</span>
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Filter tabs */}
        <div className="mb-3 flex gap-1 border-b">
          {(
            [
              ['accepted', `ผ่าน (${job.summary.accepted})`],
              ['flagged', `ต้องตรวจสอบ (${job.summary.flagged})`],
              ['rejected', `ปฏิเสธ (${job.summary.rejected})`],
              ['all', 'ทั้งหมด'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'border-b-2 px-3 py-2 text-sm transition',
                filter === key
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Item list */}
        <div className="space-y-3 pb-32">
          {filteredItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              selected={selectedItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">ไม่มีรายการในหมวดนี้</div>
          )}
        </div>

        {/* Sticky confirm bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 lg:px-6">
            <div className="text-sm">
              เลือกนำเข้า <span className="font-semibold">{selectedItems.size}</span> รายการ
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-xs text-muted-foreground">
              รายการที่เลือกจะถูก insert เข้า products table
            </div>
            <Button
              size="lg"
              className="ml-auto min-w-[200px]"
              disabled={selectedItems.size === 0 || pending}
              onClick={handleConfirm}
            >
              {pending ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" /> กำลังนำเข้า...
                </>
              ) : (
                <>
                  ยืนยันนำเข้า ({selectedItems.size})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </MarketplacePage>
  );
}

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: 'default' | 'green' | 'amber' | 'red';
  icon?: React.ReactNode;
}) {
  const colorClass =
    color === 'green'
      ? 'text-green-600'
      : color === 'amber'
        ? 'text-amber-600'
        : color === 'red'
          ? 'text-destructive'
          : 'text-foreground';
  return (
    <Card className="p-3">
      <div className={cn('flex items-center gap-1 text-xs text-muted-foreground', colorClass)}>
        {icon}
        {label}
      </div>
      <div className={cn('mt-1 text-2xl font-semibold', colorClass)}>{value}</div>
    </Card>
  );
}

function ItemRow({
  item,
  selected,
  onToggle,
}: {
  item: ImportJobResult['items'][number];
  selected: boolean;
  onToggle: () => void;
}) {
  const t = item.translated as
    | undefined
    | {
        title: { th: string; en: string };
        category: string;
        priceTHB: number;
        compareAtTHB: number;
        costTHB: number;
      };

  const disabled = item.status === 'rejected';

  return (
    <Card
      className={cn(
        'overflow-hidden transition',
        selected && 'ring-2 ring-primary',
        disabled && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          disabled={disabled}
          className="mt-1"
        />

        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded">
          <Image
            src={item.primaryImage}
            alt={item.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              {/* Before/after titles */}
              <div className="text-xs text-muted-foreground line-through line-clamp-1">
                {item.title}
              </div>
              {item.titleTh && (
                <div className="font-medium text-sm line-clamp-2">{item.titleTh}</div>
              )}
            </div>
            <StatusBadge status={item.status} category={item.flaggedCategory} />
          </div>

          {/* IP rejection reason */}
          {item.status === 'rejected' && item.rejectionReason && (
            <div className="mt-2 rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1.5 text-xs text-destructive">
              <span className="font-medium">เหตุผล: </span>
              {item.rejectionReason}
            </div>
          )}

          {item.status === 'flagged' && item.rejectionReason && (
            <div className="mt-2 rounded-md border border-amber-500/40 bg-amber-50 px-2 py-1.5 text-xs text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
              <span className="font-medium">ต้องตรวจสอบ: </span>
              {item.rejectionReason}
            </div>
          )}

          {/* Translation preview */}
          {t && (
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <PreviewItem
                label="หมวด"
                value={t.category}
              />
              <PreviewItem
                label="ต้นทุน"
                value={`฿${item.costTHB?.toLocaleString()}`}
              />
              <PreviewItem
                label="ราคาขาย"
                value={
                  <>
                    <span className="text-red-600 font-semibold">฿{t.priceTHB.toLocaleString()}</span>
                    <span className="ml-1 text-[10px] text-muted-foreground line-through">
                      ฿{t.compareAtTHB.toLocaleString()}
                    </span>
                  </>
                }
              />
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground">{item.externalId}</span>
            {!disabled && (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]">
                <Edit3 className="mr-1 h-3 w-3" /> แก้ก่อนนำเข้า
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status, category }: { status: string; category?: string }) {
  if (status === 'accepted') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] shrink-0">
        <Check className="mr-0.5 h-3 w-3" /> ผ่าน
      </Badge>
    );
  }
  if (status === 'flagged') {
    return (
      <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 text-[10px] shrink-0">
        <AlertTriangle className="mr-0.5 h-3 w-3" /> ตรวจสอบ
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-[10px] shrink-0">
      <XCircle className="mr-0.5 h-3 w-3" /> ปฏิเสธ
    </Badge>
  );
}

function PreviewItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-xs">{value}</div>
    </div>
  );
}
