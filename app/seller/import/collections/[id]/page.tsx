'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Edit2,
  ImageIcon,
  Languages,
  Loader2,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { MarketplacePage } from '@/components/layout/marketplace-page';
import { IpRiskBadge } from '@/components/seller/import/ip-risk-badge';
import { MarketplaceOverlapBadge } from '@/components/seller/import/marketplace-overlap-badge';
import {
  EditableField,
  validateDescription,
  validateTitle,
} from '@/components/seller/import/editable-field';
import { PriceEditor } from '@/components/seller/import/price-editor';
import { useCollectionStore } from '@/lib/import-collections/store';
import type { CollectionItem } from '@/lib/import-collections/store';
import { bulkTranslate, bulkImport } from '@/lib/import-collections/actions';

export default function CollectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const collection = useCollectionStore((s) => s.collections.find((c) => c.id === params.id));
  const renameCollection = useCollectionStore((s) => s.renameCollection);
  const setTargetStore = useCollectionStore((s) => s.setTargetStore);
  const removeItem = useCollectionStore((s) => s.removeItem);
  const setPrimaryImage = useCollectionStore((s) => s.setPrimaryImage);
  const toggleImageSelected = useCollectionStore((s) => s.toggleImageSelected);
  const setItemTranslation = useCollectionStore((s) => s.setItemTranslation);
  const updateTranslationField = useCollectionStore((s) => s.updateTranslationField);
  const resetTranslationToAi = useCollectionStore((s) => s.resetTranslationToAi);
  const resetAllTranslationsToAi = useCollectionStore((s) => s.resetAllTranslationsToAi);
  const setStatus = useCollectionStore((s) => s.setStatus);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(collection?.name ?? '');
  const [storeInput, setStoreInput] = useState(collection?.targetStoreId ?? '');
  const [translating, startTranslating] = useTransition();
  const [importing, startImporting] = useTransition();
  const [translateProgress, setTranslateProgress] = useState<{ done: number; total: number } | null>(null);
  const [imported, setImported] = useState<number | null>(null);

  if (!collection) {
    return (
      <MarketplacePage>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">ไม่พบคอลเลคชั่นนี้</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/seller/import/collections">กลับไปรายการ</Link>
          </Button>
        </div>
      </MarketplacePage>
    );
  }

  const translatableItems = collection.items.filter(
    (i) => !i.translated && i.product.ipVerdict !== 'REJECTED',
  );
  const importableItems = collection.items.filter(
    (i) => i.translated && i.product.ipVerdict !== 'REJECTED',
  );
  const editedItems = collection.items.filter(
    (i) =>
      i.translated &&
      i.aiTranslation &&
      (i.translated.titleTh !== i.aiTranslation.titleTh ||
        i.translated.descriptionTh !== i.aiTranslation.descriptionTh ||
        i.translated.priceTHB !== i.aiTranslation.priceTHB ||
        i.translated.compareAtTHB !== i.aiTranslation.compareAtTHB),
  );

  const handleTranslateAll = () => {
    if (translatableItems.length === 0) return;
    setStatus(collection.id, 'processing');
    setTranslateProgress({ done: 0, total: translatableItems.length });
    startTranslating(async () => {
      const results = await bulkTranslate(translatableItems);
      for (const r of results) {
        setItemTranslation(collection.id, r.itemId, r.translated);
      }
      setStatus(collection.id, 'ready');
      setTranslateProgress(null);
    });
  };

  const handleConfirmImport = () => {
    if (importableItems.length === 0) return;
    if (!collection.targetStoreId) {
      alert('กรุณากำหนดร้านปลายทางก่อน');
      return;
    }
    startImporting(async () => {
      const result = await bulkImport({
        collectionId: collection.id,
        storeId: collection.targetStoreId!,
        items: importableItems,
      });
      if (result.ok) {
        setStatus(collection.id, 'imported');
        setImported(result.importedCount);
      }
    });
  };

  if (imported !== null) {
    return (
      <MarketplacePage>
        <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
          <h1 className="mt-4 text-xl font-semibold">นำเข้าสำเร็จ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ส่ง {imported} รายการเข้าร้าน {collection.targetStoreId} แล้ว
          </p>
          <div className="mt-6 flex gap-2">
            <Button asChild variant="outline">
              <Link href="/seller/import/collections">กลับไปรายการคอลเลคชั่น</Link>
            </Button>
            <Button asChild>
              <Link href="/seller/products">
                ดูสินค้าในร้าน <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </MarketplacePage>
    );
  }

  return (
    <MarketplacePage>
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        <Link
          href="/seller/import/collections"
          className="mb-2 inline-flex items-center text-xs text-muted-foreground hover:underline"
        >
          <ChevronLeft className="h-3 w-3" /> กลับไปรายการคอลเลคชั่น
        </Link>

        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="text-lg font-semibold"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (nameInput.trim()) renameCollection(collection.id, nameInput.trim());
                    setEditingName(false);
                  }}
                >
                  บันทึก
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold lg:text-2xl">{collection.name}</h1>
                <button
                  onClick={() => {
                    setNameInput(collection.name);
                    setEditingName(true);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {collection.items.length} รายการ · สร้าง{' '}
              {new Date(collection.createdAt).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>

        {/* Target store + progress card */}
        <Card className="mb-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1 text-xs">ร้านปลายทาง</Label>
              <Input
                value={storeInput}
                onChange={(e) => setStoreInput(e.target.value)}
                onBlur={() => setTargetStore(collection.id, storeInput || undefined)}
                placeholder="store_1"
                className="h-9"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                สินค้าจะถูก insert เข้าร้านนี้เมื่อยืนยันนำเข้า
              </p>
            </div>
            <div>
              <Label className="mb-1 text-xs">ความคืบหน้า</Label>
              <div className="space-y-1.5 text-xs">
                <ProgressRow label="ทั้งหมด" value={collection.items.length} />
                <ProgressRow
                  label="แปลแล้ว"
                  value={collection.items.filter((i) => i.translated).length}
                  total={collection.items.filter((i) => i.product.ipVerdict !== 'REJECTED').length}
                  color="text-blue-600"
                />
                {editedItems.length > 0 && (
                  <ProgressRow
                    label="แก้คำแปล"
                    value={editedItems.length}
                    color="text-violet-600"
                  />
                )}
                <ProgressRow
                  label="ถูกปฏิเสธ"
                  value={collection.items.filter((i) => i.product.ipVerdict === 'REJECTED').length}
                  color="text-red-600"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Bulk action toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border bg-card p-3">
          <Button
            size="sm"
            onClick={handleTranslateAll}
            disabled={translating || translatableItems.length === 0}
          >
            {translating ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                {translateProgress
                  ? `แปล ${translateProgress.done}/${translateProgress.total}`
                  : 'กำลังแปล...'}
              </>
            ) : (
              <>
                <Languages className="mr-1 h-3 w-3" /> แปลทั้งหมด ({translatableItems.length})
              </>
            )}
          </Button>

          {editedItems.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (confirm(`รีเซ็ตคำแปล ${editedItems.length} รายการกลับไปใช้ AI default?`)) {
                  resetAllTranslationsToAi(collection.id);
                }
              }}
            >
              <RotateCcw className="mr-1 h-3 w-3" /> รีเซ็ต AI ({editedItems.length})
            </Button>
          )}

          <span className="text-[10px] text-muted-foreground">
            คลิกที่ title/description/ราคาเพื่อแก้ไขก่อนนำเข้า
          </span>

          <Separator orientation="vertical" className="mx-2 h-6" />

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              พร้อมนำเข้า: <strong className="text-foreground">{importableItems.length}</strong>
            </span>
            <Button
              size="sm"
              onClick={handleConfirmImport}
              disabled={importing || importableItems.length === 0 || !collection.targetStoreId}
            >
              {importing ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="mr-1 h-3 w-3" />
              )}
              ยืนยันนำเข้า ({importableItems.length})
            </Button>
          </div>
        </div>

        {/* Items list */}
        <div className="space-y-2 pb-12">
          {collection.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onRemove={() => removeItem(collection.id, item.id)}
              onSetPrimary={(idx) => setPrimaryImage(collection.id, item.id, idx)}
              onToggleImage={(idx) => toggleImageSelected(collection.id, item.id, idx)}
              onUpdateField={(field, value) =>
                updateTranslationField(collection.id, item.id, field, value)
              }
              onResetToAi={() => resetTranslationToAi(collection.id, item.id)}
            />
          ))}
          {collection.items.length === 0 && (
            <Card className="flex flex-col items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">ยังไม่มีสินค้าในคอลเลคชั่นนี้</p>
              <Button asChild variant="outline" className="mt-3">
                <Link href="/seller/import">ไปค้นหาสินค้าเพิ่ม</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </MarketplacePage>
  );
}

function ProgressRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total?: number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium tabular-nums', color)}>
        {value}
        {total !== undefined && <span className="text-muted-foreground"> / {total}</span>}
      </span>
    </div>
  );
}

function ItemRow({
  item,
  onRemove,
  onSetPrimary,
  onToggleImage,
  onUpdateField,
  onResetToAi,
}: {
  item: CollectionItem;
  onRemove: () => void;
  onSetPrimary: (idx: number) => void;
  onToggleImage: (idx: number) => void;
  onUpdateField: <K extends keyof NonNullable<CollectionItem['translated']>>(
    field: K,
    value: NonNullable<CollectionItem['translated']>[K],
  ) => void;
  onResetToAi: () => void;
}) {
  const isRejected = item.product.ipVerdict === 'REJECTED';
  const selectedIdxs = item.selectedImageIndexes ?? item.product.images.map((_, i) => i);
  const primaryIdx = item.primaryImageIndex ?? 0;
  const t = item.translated;
  const ai = item.aiTranslation;

  return (
    <Card className={cn('overflow-hidden', isRejected && 'opacity-60')}>
      <div className="flex gap-3 p-3">
        {/* Image gallery */}
        <div className="w-64 shrink-0">
          <div className="relative aspect-square overflow-hidden rounded">
            <Image
              src={item.product.images[primaryIdx] ?? item.product.primaryImage}
              alt=""
              fill
              className="object-cover"
              sizes="256px"
            />
            <Badge className="absolute left-1 top-1 bg-primary text-[9px]">
              <ImageIcon className="mr-0.5 h-2.5 w-2.5" /> หลัก
            </Badge>
          </div>
          {item.product.images.length > 1 && (
            <div className="mt-1.5">
              <div className="text-[10px] text-muted-foreground mb-1">
                เลือกภาพ ({selectedIdxs.length}/{item.product.images.length}) — กดเพื่อตั้งเป็นหลัก
              </div>
              <div className="grid grid-cols-5 gap-1">
                {item.product.images.map((src, idx) => {
                  const isSelected = selectedIdxs.includes(idx);
                  const isPrimary = idx === primaryIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isSelected) onSetPrimary(idx);
                        else onToggleImage(idx);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onToggleImage(idx);
                      }}
                      className={cn(
                        'relative aspect-square overflow-hidden rounded transition',
                        isPrimary && 'ring-2 ring-primary ring-offset-1',
                        !isSelected && 'opacity-30',
                      )}
                      title={
                        isSelected
                          ? 'คลิกซ้าย = ตั้งหลัก · คลิกขวา = ลบ'
                          : 'คลิกเพื่อใช้ภาพนี้'
                      }
                    >
                      <Image src={src} alt="" fill className="object-cover" sizes="48px" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Title + translation + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground line-clamp-1 line-through">
                {item.product.title}
              </div>

              {t ? (
                <EditableField
                  value={t.titleTh}
                  originalValue={ai?.titleTh}
                  onSave={(v) => onUpdateField('titleTh', v)}
                  onResetToAi={() =>
                    ai && onUpdateField('titleTh', ai.titleTh)
                  }
                  validate={validateTitle}
                  size="lg"
                  placeholder="ใส่ชื่อสินค้าภาษาไทย"
                />
              ) : (
                <h3 className="text-sm">{item.product.title}</h3>
              )}
            </div>
            <button
              onClick={onRemove}
              className="shrink-0 text-muted-foreground hover:text-destructive"
              title="ลบจากคอลเลคชั่น"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <IpRiskBadge product={item.product} />
            <MarketplaceOverlapBadge product={item.product} />
            <span className="font-mono text-[10px] text-muted-foreground">{item.externalId}</span>
          </div>

          {t && ai ? (
            <div className="mt-3 grid gap-x-3 gap-y-3 sm:grid-cols-3 text-xs">
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">หมวด</div>
                <div className="font-medium text-xs">{t.categoryTh}</div>
              </div>

              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">ต้นทุน</div>
                <div className="text-xs">฿{t.costTHB.toLocaleString()}</div>
              </div>

              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">ราคาขาย (คลิกเพื่อแก้)</div>
                <PriceEditor
                  costTHB={t.costTHB}
                  priceTHB={t.priceTHB}
                  compareAtTHB={t.compareAtTHB}
                  originalPriceTHB={ai.priceTHB}
                  originalCompareAtTHB={ai.compareAtTHB}
                  onChange={({ priceTHB, compareAtTHB }) => {
                    onUpdateField('priceTHB', priceTHB);
                    onUpdateField('compareAtTHB', compareAtTHB);
                  }}
                  onResetToAi={() => {
                    onUpdateField('priceTHB', ai.priceTHB);
                    onUpdateField('compareAtTHB', ai.compareAtTHB);
                  }}
                />
              </div>

              <div className="sm:col-span-3">
                <div className="text-[10px] text-muted-foreground mb-0.5">คำอธิบาย</div>
                <EditableField
                  value={t.descriptionTh}
                  originalValue={ai.descriptionTh}
                  onSave={(v) => onUpdateField('descriptionTh', v)}
                  onResetToAi={() => onUpdateField('descriptionTh', ai.descriptionTh)}
                  validate={validateDescription}
                  multiline
                  size="sm"
                  placeholder="ใส่คำอธิบายสินค้า เน้นจุดเด่น สเปก ประโยชน์"
                />
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-md border border-dashed bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
              {isRejected ? (
                <span>ถูกปฏิเสธ — จะไม่ถูกแปล (เหตุ: {item.product.ipReason})</span>
              ) : (
                <span>ยังไม่ได้แปล กดปุ่ม &quot;แปลทั้งหมด&quot; ด้านบน</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
