'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CATEGORY_TREE } from '@/lib/import-filters/categories';
import { useFilterStore } from '@/lib/import-filters/store';
import { getActiveFilterCount } from '@/lib/import-filters/types';
import type { MarketplaceStatus } from '@/lib/import-sources/types';

interface FilterSidebarProps {
  onApply?: () => void;
}

export function FilterSidebar({ onApply }: FilterSidebarProps) {
  const f = useFilterStore((s) => s.current);
  const setFilter = useFilterStore((s) => s.setFilter);
  const setMany = useFilterStore((s) => s.setMany);
  const reset = useFilterStore((s) => s.resetKeepingKeyword);
  const toggleCategory = useFilterStore((s) => s.toggleCategory);
  const toggleExcludeTag = useFilterStore((s) => s.toggleExcludeTag);
  const toggleMarketplaceStatus = useFilterStore((s) => s.toggleMarketplaceStatus);
  const savePreset = useFilterStore((s) => s.savePreset);
  const presets = useFilterStore((s) => s.savedPresets);
  const loadPreset = useFilterStore((s) => s.loadPreset);
  const deletePreset = useFilterStore((s) => s.deletePreset);

  const activeCount = getActiveFilterCount(f);

  return (
    <div className="space-y-4 text-sm">
      {/* Header: active count + reset + save preset */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">กรอง</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={() => {
              const name = prompt('ตั้งชื่อ preset:');
              if (name?.trim()) savePreset(name.trim());
            }}
          >
            <Save className="mr-1 h-3 w-3" /> บันทึก
          </Button>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={reset}
            >
              <RotateCcw className="mr-1 h-3 w-3" /> ล้าง
            </Button>
          )}
        </div>
      </div>

      {/* Saved presets */}
      {presets.length > 0 && (
        <Section title="เซ็ตที่บันทึกไว้" defaultOpen={false} count={presets.length}>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <div
                key={p.id}
                className="group inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 text-[11px] hover:bg-accent"
              >
                <button onClick={() => loadPreset(p.id)} className="font-medium">
                  {p.name}
                </button>
                <button
                  onClick={() => confirm(`ลบ "${p.name}"?`) && deletePreset(p.id)}
                  className="opacity-50 hover:text-destructive hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Quick filters */}
      <Section title="ตัวกรองด่วน" defaultOpen>
        <div className="grid grid-cols-2 gap-1.5">
          <Chip
            active={f.freeShipping}
            onClick={() => setFilter('freeShipping', !f.freeShipping)}
            icon={<Truck className="h-3 w-3" />}
          >
            ส่งฟรี
          </Chip>
          <Chip
            active={f.shipFromTH}
            onClick={() => setFilter('shipFromTH', !f.shipFromTH)}
            icon={<Truck className="h-3 w-3" />}
          >
            ส่งจาก TH
          </Chip>
          <Chip
            active={f.minOrders >= 1000}
            onClick={() => setFilter('minOrders', f.minOrders >= 1000 ? 0 : 1000)}
            icon={<TrendingUp className="h-3 w-3" />}
          >
            ยอด 1k+
          </Chip>
          <Chip
            active={f.minRating >= 4.5}
            onClick={() => setFilter('minRating', f.minRating >= 4.5 ? 0 : 4.5)}
            icon={<Star className="h-3 w-3" />}
          >
            4.5+ ดาว
          </Chip>
          <Chip
            active={f.hasVariants}
            onClick={() => setFilter('hasVariants', !f.hasVariants)}
          >
            มีตัวเลือก
          </Chip>
          <Chip
            active={f.hasMultipleImages}
            onClick={() => setFilter('hasMultipleImages', !f.hasMultipleImages)}
          >
            ภาพ 2+
          </Chip>
        </div>
      </Section>

      <Separator />

      {/* Categories */}
      <Section
        title="หมวดหมู่"
        count={f.selectedCategories.length || undefined}
      >
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {CATEGORY_TREE.map((top) => (
            <CategoryGroup
              key={top.slug}
              top={top.slug}
              label={top.label}
              childCategories={top.children?.map((c) => ({ slug: c.slug, label: c.label })) ?? []}
              selected={f.selectedCategories}
              onToggle={toggleCategory}
            />
          ))}
        </div>
      </Section>

      <Separator />

      {/* Marketplace overlap status */}
      <Section
        title={
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> สถานะใน Basketplace
          </span>
        }
        count={f.marketplaceStatusFilter.length || undefined}
        defaultOpen
      >
        <div className="space-y-1">
          <MarketplaceChip
            status="not_selling"
            label="ยังไม่มีคนขาย"
            hint="โอกาสเปิดร้านใหม่ ไม่มีคู่แข่ง"
            icon={<Sparkles className="h-3 w-3" />}
            colorClass="border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
            selected={f.marketplaceStatusFilter.includes('not_selling')}
            onToggle={() => toggleMarketplaceStatus('not_selling')}
          />
          <MarketplaceChip
            status="low_competition"
            label="คู่แข่งน้อย (1-2 ร้าน)"
            hint="ตลาดเริ่มเปิด มีพื้นที่"
            icon={<Users className="h-3 w-3" />}
            colorClass="border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200"
            selected={f.marketplaceStatusFilter.includes('low_competition')}
            onToggle={() => toggleMarketplaceStatus('low_competition')}
          />
          <MarketplaceChip
            status="moderate_competition"
            label="คู่แข่งปานกลาง (3-5)"
            hint="ต้องแข่งด้วยภาพ + ราคา"
            icon={<Users className="h-3 w-3" />}
            colorClass="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
            selected={f.marketplaceStatusFilter.includes('moderate_competition')}
            onToggle={() => toggleMarketplaceStatus('moderate_competition')}
          />
          <MarketplaceChip
            status="saturated"
            label="อิ่มตัว (6+ ร้าน)"
            hint="ตัดราคาเป็นหลัก กำไรบาง"
            icon={<TrendingUp className="h-3 w-3" />}
            colorClass="border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
            selected={f.marketplaceStatusFilter.includes('saturated')}
            onToggle={() => toggleMarketplaceStatus('saturated')}
          />
        </div>
      </Section>

      <Separator />

      {/* Price + margin */}
      <Section title="ราคา + กำไร" defaultOpen>
        <div className="space-y-3">
          <div>
            <Label className="mb-1 text-[11px]">ต้นทุน USD</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0"
                value={f.minPriceUSD || ''}
                onChange={(e) => setFilter('minPriceUSD', Number(e.target.value) || 0)}
                className="h-8 text-xs"
              />
              <span className="text-muted-foreground">−</span>
              <Input
                type="number"
                placeholder="100"
                value={f.maxPriceUSD === 100 ? '' : f.maxPriceUSD}
                onChange={(e) => setFilter('maxPriceUSD', Number(e.target.value) || 100)}
                className="h-8 text-xs"
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              ≈ ฿{Math.round(f.minPriceUSD * 36).toLocaleString()} − ฿
              {Math.round(f.maxPriceUSD * 36).toLocaleString()}
            </p>
          </div>

          <div>
            <Label className="mb-1 flex items-center justify-between text-[11px]">
              <span>กำไรขั้นต่ำ (markup)</span>
              <span className="font-semibold">×{f.minMarginX}</span>
            </Label>
            <input
              type="range"
              min={1.5}
              max={5}
              step={0.5}
              value={f.minMarginX}
              onChange={(e) => setFilter('minMarginX', Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
              <span>1.5x</span>
              <span>3x</span>
              <span>5x</span>
            </div>
          </div>

          <div>
            <Label className="mb-1 text-[11px]">เรียงโดย</Label>
            <select
              value={f.sortBy}
              onChange={(e) => setFilter('sortBy', e.target.value as typeof f.sortBy)}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="orders">ขายดีที่สุด</option>
              <option value="rating">เรตติ้งสูงสุด</option>
              <option value="price_asc">ราคาต่ำ→สูง</option>
              <option value="price_desc">ราคาสูง→ต่ำ</option>
              <option value="margin">กำไรสูงสุด</option>
              <option value="relevance">เกี่ยวข้อง</option>
            </select>
          </div>
        </div>
      </Section>

      <Separator />

      {/* Quality thresholds */}
      <Section title="คุณภาพ + ความน่าเชื่อถือ">
        <div className="space-y-3">
          <div>
            <Label className="mb-1 flex items-center justify-between text-[11px]">
              <span>เรตติ้งขั้นต่ำ</span>
              <span className="font-semibold">
                {f.minRating > 0 ? `${f.minRating.toFixed(1)} ดาว` : 'ทุกระดับ'}
              </span>
            </Label>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={f.minRating}
              onChange={(e) => setFilter('minRating', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <Label className="mb-1 flex items-center justify-between text-[11px]">
              <span>ยอดขายขั้นต่ำ</span>
              <span className="font-semibold">
                {f.minOrders > 0 ? `${f.minOrders.toLocaleString()}+` : 'ทุกระดับ'}
              </span>
            </Label>
            <div className="grid grid-cols-4 gap-1">
              {[0, 100, 1000, 5000].map((v) => (
                <button
                  key={v}
                  onClick={() => setFilter('minOrders', v)}
                  className={cn(
                    'rounded border px-1 py-1 text-[10px]',
                    f.minOrders === v
                      ? 'border-primary bg-primary/10 font-medium text-primary'
                      : 'border-input hover:bg-accent',
                  )}
                >
                  {v === 0 ? 'ทั้งหมด' : `${v.toLocaleString()}+`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1 flex items-center justify-between text-[11px]">
              <span>จัดส่งไม่เกิน</span>
              <span className="font-semibold">{f.maxShippingDays} วัน</span>
            </Label>
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={f.maxShippingDays}
              onChange={(e) => setFilter('maxShippingDays', Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
              <span>3 วัน</span>
              <span>15 วัน</span>
              <span>30 วัน</span>
            </div>
          </div>
        </div>
      </Section>

      <Separator />

      {/* IP safety */}
      <Section
        title={
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" /> ความปลอดภัย IP
          </span>
        }
        defaultOpen
      >
        <div className="space-y-2">
          <label className="flex items-start gap-2 text-xs cursor-pointer">
            <Checkbox
              checked={f.hideRejected}
              onCheckedChange={(c) => setFilter('hideRejected', !!c)}
              className="mt-0.5"
            />
            <span>
              ซ่อนสินค้าที่ถูกปฏิเสธ
              <span className="block text-[10px] text-muted-foreground">
                แบรนด์ปลอม, ลิขสิทธิ์, ของควบคุม
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-xs cursor-pointer">
            <Checkbox
              checked={f.hideFlagged}
              onCheckedChange={(c) => setFilter('hideFlagged', !!c)}
              className="mt-0.5"
            />
            <span>
              ซ่อนสินค้าที่ flagged
              <span className="block text-[10px] text-muted-foreground">
                ของก้ำกึ่ง ต้องเช็คเพิ่ม
              </span>
            </span>
          </label>

          <div>
            <Label className="mb-1.5 text-[11px]">แบนแท็ก</Label>
            <div className="flex flex-wrap gap-1">
              {['replica', 'licensed-character', 'vape', 'health-claim'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleExcludeTag(tag)}
                  className={cn(
                    'rounded px-2 py-0.5 text-[10px] transition',
                    f.excludeTags.includes(tag)
                      ? 'bg-destructive/15 text-destructive line-through'
                      : 'bg-muted text-muted-foreground hover:bg-accent',
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {onApply && (
        <div className="sticky bottom-0 pt-3 border-t bg-background -mx-4 px-4 pb-3 lg:relative lg:border-0 lg:px-0 lg:pb-0">
          <Button onClick={onApply} className="w-full">
            ใช้ตัวกรอง
          </Button>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen = false,
  count,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-1 text-xs font-medium"
      >
        <span className="flex items-center gap-1.5">
          {title}
          {count !== undefined && (
            <Badge variant="secondary" className="h-4 px-1 text-[9px]">
              {count}
            </Badge>
          )}
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

function Chip({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-[11px] transition',
        active
          ? 'border-primary bg-primary/10 font-medium text-primary'
          : 'border-input hover:bg-accent',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function CategoryGroup({
  top,
  label,
  childCategories,
  selected,
  onToggle,
}: {
  top: string;
  label: string;
  childCategories: Array<{ slug: string; label: string }>;
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const childSelectedCount = childCategories.filter((c) => selected.includes(c.slug)).length;
  const isTopSelected = selected.includes(top);

  return (
    <div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-0.5 text-muted-foreground"
        >
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        <label className="flex flex-1 items-center gap-1.5 cursor-pointer py-0.5 text-xs">
          <Checkbox
            checked={isTopSelected}
            onCheckedChange={() => onToggle(top)}
            className="h-3.5 w-3.5"
          />
          {label}
          {childSelectedCount > 0 && (
            <span className="text-[10px] text-primary">({childSelectedCount})</span>
          )}
        </label>
      </div>
      {open && (
        <div className="ml-5 mt-0.5 space-y-0.5">
          {childCategories.map((c) => (
            <label
              key={c.slug}
              className="flex cursor-pointer items-center gap-1.5 py-0.5 text-[11px]"
            >
              <Checkbox
                checked={selected.includes(c.slug)}
                onCheckedChange={() => onToggle(c.slug)}
                className="h-3 w-3"
              />
              {c.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function MarketplaceChip({
  status: _status,
  label,
  hint,
  icon,
  colorClass,
  selected,
  onToggle,
}: {
  status: MarketplaceStatus;
  label: string;
  hint: string;
  icon: React.ReactNode;
  colorClass: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left transition',
        selected ? colorClass : 'border-input hover:bg-accent',
      )}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="flex-1">
        <span className="block text-[11px] font-medium leading-tight">{label}</span>
        <span className="block text-[9px] opacity-75 leading-tight">{hint}</span>
      </span>
      {selected && <Checkbox checked className="mt-0.5 h-3 w-3" />}
    </button>
  );
}
