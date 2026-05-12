import { CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlockProps } from '@/lib/templates/renderer';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const THEMES = [
  'Winter warmth',
  'Spring fresh',
  'Summer escape',
  'Autumn cozy',
  'Holiday glow',
  'New year start',
];

export function DropCalendarBlock({ block }: BlockProps) {
  if (block.variant !== 'monthly-grid') return null;

  const drops = generateDrops();

  return (
    <div className="p-3">
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <h2 className="text-base font-semibold">Monthly drops</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {drops.map((d) => (
              <div key={d.id} className="rounded-md border p-2 text-center">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {d.month}
                </div>
                <div className="mt-0.5 line-clamp-1 text-sm font-medium">{d.title}</div>
                <Badge
                  variant={d.status === 'upcoming' ? 'default' : 'secondary'}
                  className="mt-1 text-[10px]"
                >
                  {d.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateDrops() {
  const now = new Date();
  // 2 past + 1 current + 3 upcoming
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() + i - 2, 1);
    const isPast = i < 2;
    const isCurrent = i === 2;
    return {
      id: `drop-${i}`,
      month: MONTHS[date.getMonth()],
      title: THEMES[i % THEMES.length],
      status: isPast ? 'past' : isCurrent ? 'this month' : 'upcoming',
    };
  });
}
