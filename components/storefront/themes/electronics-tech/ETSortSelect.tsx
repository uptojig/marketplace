'use client';

/**
 * ETSortSelect — client island for the electronics-tech sort dropdown.
 * Receives pre-computed sort URLs (string map) to avoid passing
 * functions across the server→client RSC boundary.
 */

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

interface ETSortSelectProps {
  sortKey: string;
  sortOptions: Array<{ key: string; label: string }>;
  /** Pre-computed: sortKey → URL string */
  sortUrls: Record<string, string>;
}

export function ETSortSelect({ sortKey, sortOptions, sortUrls }: ETSortSelectProps) {
  return (
    <label className="inline-flex items-center gap-2">
      <span
        data-tech-mono="true"
        className="text-[10px] uppercase"
        style={{
          color: 'var(--shop-ink-muted)',
          fontFamily: TECH_MONO_FONT,
          letterSpacing: '0.18em',
          fontWeight: 600,
        }}
      >
        Sort By
      </span>
      <select
        defaultValue={sortKey}
        onChange={(e) => {
          const next = e.currentTarget.value;
          const url = sortUrls[next];
          if (url && typeof window !== 'undefined') {
            window.location.assign(url);
          }
        }}
        data-tech-mono="true"
        className="appearance-none rounded-md border bg-white px-3 py-1.5 pr-7 text-xs uppercase focus:outline-none"
        style={{
          borderColor: 'var(--shop-border)',
          color: 'var(--shop-ink)',
          fontFamily: TECH_MONO_FONT,
          letterSpacing: '0.12em',
          fontWeight: 600,
          backgroundImage:
            'linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)',
          backgroundPosition:
            'calc(100% - 14px) 50%, calc(100% - 9px) 50%',
          backgroundSize: '5px 5px, 5px 5px',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {sortOptions.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
