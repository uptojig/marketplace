'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface QualityHint {
  level: 'ok' | 'warn' | 'error';
  message: string;
}

interface EditableFieldProps {
  value: string;
  /** Original AI value — for "reset" button + diff indicator */
  originalValue?: string;
  onSave: (next: string) => void;
  onResetToAi?: () => void;
  multiline?: boolean;
  placeholder?: string;
  /** Char count hints. Returns warnings to display below the input. */
  validate?: (value: string) => QualityHint[];
  /** Render the un-editing display version. Defaults to plain text */
  renderDisplay?: (value: string) => React.ReactNode;
  className?: string;
  /** Smaller text variant for inline secondary fields */
  size?: 'lg' | 'md' | 'sm';
}

export function EditableField({
  value,
  originalValue,
  onSave,
  onResetToAi,
  multiline = false,
  placeholder,
  validate,
  renderDisplay,
  className,
  size = 'md',
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if ('setSelectionRange' in inputRef.current) {
        (inputRef.current as HTMLInputElement).setSelectionRange(value.length, value.length);
      }
    }
  }, [editing, value]);

  const isEdited = originalValue !== undefined && originalValue !== value;
  const hints = validate ? validate(editing ? draft : value) : [];

  const handleSave = () => {
    if (draft !== value) onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const sizeClasses = {
    lg: 'text-base font-medium',
    md: 'text-sm',
    sm: 'text-xs',
  }[size];

  if (editing) {
    return (
      <div className={cn('space-y-1.5', className)}>
        {multiline ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel();
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
            }}
            placeholder={placeholder}
            rows={4}
            className={cn(sizeClasses, 'resize-y')}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel();
              if (e.key === 'Enter') handleSave();
            }}
            placeholder={placeholder}
            className={cn(sizeClasses, 'h-9')}
          />
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            {hints.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {hints.map((h, i) => (
                  <span
                    key={i}
                    className={cn(
                      'text-[10px]',
                      h.level === 'error' && 'text-destructive',
                      h.level === 'warn' && 'text-amber-600',
                      h.level === 'ok' && 'text-muted-foreground',
                    )}
                  >
                    {h.message}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={handleCancel} className="h-7 px-2 text-xs">
              <X className="h-3 w-3" />
            </Button>
            <Button size="sm" onClick={handleSave} className="h-7 px-2 text-xs">
              <Check className="mr-1 h-3 w-3" /> บันทึก
            </Button>
          </div>
        </div>
        {multiline && (
          <p className="text-[10px] text-muted-foreground">
            Esc = ยกเลิก · ⌘+Enter = บันทึก
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn('group relative cursor-text', className)}
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setEditing(true);
      }}
    >
      <div
        className={cn(
          sizeClasses,
          'rounded-md px-1.5 py-1 -mx-1.5 transition group-hover:bg-accent/50',
          !value && 'text-muted-foreground italic',
        )}
      >
        {value ? (renderDisplay ? renderDisplay(value) : value) : placeholder ?? 'คลิกเพื่อแก้ไข'}
      </div>

      {/* Edit indicator + reset button */}
      <div className="absolute right-0 top-0.5 flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
        {isEdited && onResetToAi && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResetToAi();
            }}
            title="กลับไปใช้คำที่ AI แปล"
            className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Edited badge */}
      {isEdited && (
        <span className="ml-1 inline-flex items-center text-[9px] font-medium text-blue-600 dark:text-blue-300">
          ✏ แก้แล้ว
        </span>
      )}
    </div>
  );
}

// ============ Common validators ============

export function validateTitle(value: string): QualityHint[] {
  const len = value.length;
  const hints: QualityHint[] = [];

  if (len === 0) {
    hints.push({ level: 'error', message: 'จำเป็น' });
  } else if (len < 20) {
    hints.push({ level: 'warn', message: `${len}/100 · สั้นเกิน เพิ่มคีย์เวิร์ดให้ค้นเจอ` });
  } else if (len > 100) {
    hints.push({ level: 'warn', message: `${len}/100 · ยาวเกิน อาจถูกตัดในผลค้นหา` });
  } else {
    hints.push({ level: 'ok', message: `${len}/100 · เหมาะกับ SEO` });
  }

  return hints;
}

export function validateDescription(value: string): QualityHint[] {
  const len = value.length;
  const hints: QualityHint[] = [];

  if (len < 50) {
    hints.push({ level: 'warn', message: `${len} ตัวอักษร · ควรมี 50+ เพื่อความน่าเชื่อถือ` });
  } else if (len > 1000) {
    hints.push({ level: 'warn', message: `${len} ตัวอักษร · ยาวเกินไป สรุปให้กระชับ` });
  } else {
    hints.push({ level: 'ok', message: `${len} ตัวอักษร` });
  }

  const hasBullets = /[•▪◦·]/.test(value) || /^\s*[-*]\s/m.test(value);
  if (!hasBullets && len > 80) {
    hints.push({ level: 'ok', message: 'ลอง bullet (•) ช่วยอ่านง่ายขึ้น' });
  }

  return hints;
}
