'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import type { BlockProps } from '@/lib/templates/renderer';

export function CountdownBlock({ block }: BlockProps) {
  if (block.variant !== 'banner') return null;
  return <CountdownBanner endsAt={block.data?.endsAt as string | undefined} />;
}

function CountdownBanner({ endsAt }: { endsAt?: string }) {
  // Lock target on mount; default to 2 hours out
  const [target] = useState(() =>
    endsAt ? new Date(endsAt).getTime() : Date.now() + 2 * 60 * 60 * 1000,
  );
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3 text-white">
      <div className="flex items-center gap-3">
        <Flame className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          <div className="text-xs font-medium uppercase tracking-wide opacity-90">
            Flash deal ends in
          </div>
        </div>
        <div className="flex items-center gap-1 font-mono text-base font-bold tabular-nums">
          <span className="rounded bg-black/20 px-1.5 py-0.5">
            {hours.toString().padStart(2, '0')}
          </span>
          <span>:</span>
          <span className="rounded bg-black/20 px-1.5 py-0.5">
            {minutes.toString().padStart(2, '0')}
          </span>
          <span>:</span>
          <span className="rounded bg-black/20 px-1.5 py-0.5">
            {seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}
