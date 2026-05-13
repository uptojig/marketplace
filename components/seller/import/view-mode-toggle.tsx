'use client';

import { LayoutGrid, List, Rows3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'compact' | 'list';

const MODES: Array<{ key: ViewMode; icon: React.ComponentType<{ className?: string }>; label: string }> = [
  { key: 'grid', icon: LayoutGrid, label: 'การ์ดใหญ่' },
  { key: 'compact', icon: Rows3, label: 'การ์ดเล็ก' },
  { key: 'list', icon: List, label: 'รายการ' },
];

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex rounded-md border bg-card">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const active = value === mode.key;
        return (
          <button
            key={mode.key}
            onClick={() => onChange(mode.key)}
            title={mode.label}
            className={cn(
              'inline-flex h-8 w-9 items-center justify-center border-r last:border-r-0 transition first:rounded-l-md last:rounded-r-md',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent',
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
