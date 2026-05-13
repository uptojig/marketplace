'use client';

import { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PriceEditorProps {
  costTHB: number;
  priceTHB: number;
  compareAtTHB: number;
  originalPriceTHB?: number;
  originalCompareAtTHB?: number;
  onChange: (next: { priceTHB: number; compareAtTHB: number }) => void;
  onResetToAi?: () => void;
}

/**
 * Inline price editor with margin calculator + pricing psychology suggestions.
 * Click → opens popover with both fields + suggested endings (฿299/฿499/฿990).
 */
export function PriceEditor({
  costTHB,
  priceTHB,
  compareAtTHB,
  originalPriceTHB,
  originalCompareAtTHB,
  onChange,
  onResetToAi,
}: PriceEditorProps) {
  const [open, setOpen] = useState(false);
  const [priceInput, setPriceInput] = useState(String(priceTHB));
  const [compareInput, setCompareInput] = useState(String(compareAtTHB));

  const isEdited =
    (originalPriceTHB !== undefined && originalPriceTHB !== priceTHB) ||
    (originalCompareAtTHB !== undefined && originalCompareAtTHB !== compareAtTHB);

  const margin = costTHB > 0 ? priceTHB / costTHB : 0;
  const profit = priceTHB - costTHB;
  const profitPct = costTHB > 0 ? (profit / priceTHB) * 100 : 0;

  let marginLevel: 'low' | 'ok' | 'high' = 'ok';
  if (margin < 1.8) marginLevel = 'low';
  else if (margin > 4.5) marginLevel = 'high';

  const handleSave = () => {
    const p = Number(priceInput);
    const c = Number(compareInput);
    if (!isNaN(p) && p > 0 && !isNaN(c) && c >= p) {
      onChange({ priceTHB: p, compareAtTHB: c });
      setOpen(false);
    }
  };

  // Pricing psychology suggestions based on cost × markup
  const suggestions = useMemo(() => {
    const targets = [2.5, 3, 3.5, 4].map((m) => costTHB * m);
    return targets.map(applyPricingPsychology).filter((v, i, arr) => arr.indexOf(v) === i);
  }, [costTHB]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group inline-flex items-baseline gap-1 rounded -mx-1 px-1 py-0.5 transition hover:bg-accent/50"
        >
          <span className="font-semibold text-red-600">฿{priceTHB.toLocaleString()}</span>
          {compareAtTHB > priceTHB && (
            <span className="text-[10px] text-muted-foreground line-through">
              ฿{compareAtTHB.toLocaleString()}
            </span>
          )}
          <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
          {isEdited && (
            <span className="ml-0.5 text-[9px] font-medium text-blue-600">✏</span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72 space-y-3" align="start">
        <div className="text-xs font-medium">ราคาขาย</div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">ราคาขาย (฿)</label>
            <Input
              type="number"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">ก่อนลด (฿)</label>
            <Input
              type="number"
              value={compareInput}
              onChange={(e) => setCompareInput(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Margin calculator */}
        <div className="rounded-md bg-muted/40 p-2 text-[11px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ต้นทุน</span>
            <span className="font-medium">฿{costTHB.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">กำไรต่อชิ้น</span>
            <span
              className={cn(
                'font-medium tabular-nums',
                marginLevel === 'low' && 'text-amber-600',
              )}
            >
              ฿{profit.toLocaleString()} ({profitPct.toFixed(0)}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Markup</span>
            <span
              className={cn(
                'font-medium tabular-nums',
                marginLevel === 'low' && 'text-amber-600',
                marginLevel === 'high' && 'text-blue-600',
              )}
            >
              {margin.toFixed(2)}×
            </span>
          </div>
          {marginLevel === 'low' && (
            <p className="mt-1 text-[10px] text-amber-600">
              ⚠ กำไรน้อยเกิน — เผื่อค่าโฆษณา + จัดส่ง อาจขาดทุน
            </p>
          )}
          {marginLevel === 'high' && (
            <p className="mt-1 text-[10px] text-blue-600">
              📈 ราคาแพง — ต้องสร้าง brand value ให้สมเหตุสมผล
            </p>
          )}
        </div>

        {/* Pricing psychology suggestions */}
        {suggestions.length > 0 && (
          <div>
            <div className="mb-1 text-[10px] text-muted-foreground">เสนอราคาตามจิตวิทยา</div>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setPriceInput(String(s))}
                  className={cn(
                    'rounded border px-2 py-0.5 text-[11px] transition',
                    Number(priceInput) === s
                      ? 'border-primary bg-primary/10 font-medium'
                      : 'hover:bg-accent',
                  )}
                >
                  ฿{s.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {onResetToAi && isEdited && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onResetToAi();
                setOpen(false);
              }}
              className="h-7 gap-1 text-[11px]"
            >
              <RotateCcw className="h-3 w-3" /> AI default
            </Button>
          )}
          <Button size="sm" onClick={handleSave} className="ml-auto h-7 text-[11px]">
            บันทึก
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useMemo } from 'react';

/**
 * Pricing psychology — mirrors logic in import-pipeline/translate.ts
 */
function applyPricingPsychology(raw: number): number {
  if (raw < 100) return Math.floor(raw / 10) * 10 + 9;
  if (raw < 1000) {
    const base = Math.floor(raw / 100) * 100;
    return base + 99;
  }
  if (raw < 5000) {
    const base = Math.floor(raw / 100) * 100;
    return base - 10 + 99;
  }
  return Math.round(raw / 100) * 100;
}
