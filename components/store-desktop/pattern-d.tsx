import { BlockRenderer } from '@/lib/templates/renderer';
import { findBlock, remapForDesktop } from './utils';
import type { PatternProps } from './utils';

/**
 * Pattern D — Feed / Stream
 *
 * Used by: live-commerce, video-feed
 *
 * Live commerce layout:
 *   ┌─────────────────────┬───────────┐
 *   │                     │  Header   │
 *   │   LIVE TILE (16:9)  ├───────────┤
 *   │                     │  Chat     │
 *   ├─────────────────────┴───────────┤
 *   │   Past lives carousel           │
 *   ├─────────────────────────────────┤
 *   │   Products (4-col)              │
 *   └─────────────────────────────────┘
 *
 * Video feed layout:
 *   ┌─────────────────────────────────┐
 *   │   Store header                  │
 *   ├─────────────────────────────────┤
 *   │   Video tiles (3-col portrait)  │
 *   └─────────────────────────────────┘
 */
export function DesktopPatternD({ blocks, store }: PatternProps) {
  const liveTile = blocks.find((b) => b.type === 'live' && b.variant === 'tile');
  const replays = blocks.find((b) => b.type === 'live' && b.variant === 'replay-carousel');
  const videoFeed = findBlock(blocks, 'video-feed');
  const header = findBlock(blocks, 'store-header');
  const products = findBlock(blocks, 'product');

  // Video feed variant gets a simpler layout
  if (videoFeed && !liveTile) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-6">
        {header && (
          <div className="mb-6 border-b pb-4">
            <BlockRenderer block={header} store={store} />
          </div>
        )}
        <BlockRenderer block={remapForDesktop(videoFeed, 'D')} store={store} />
      </div>
    );
  }

  // Live commerce layout
  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-8 grid grid-cols-[1fr_320px] gap-6">
        <div>{liveTile && <BlockRenderer block={liveTile} store={store} />}</div>
        <aside className="space-y-4">
          {header && <BlockRenderer block={header} store={store} />}
          <LiveChatPanel />
        </aside>
      </div>

      {replays && (
        <div className="mb-8">
          <BlockRenderer block={replays} store={store} />
        </div>
      )}

      {products && <BlockRenderer block={remapForDesktop(products, 'D')} store={store} />}
    </div>
  );
}

function LiveChatPanel() {
  // Placeholder chat panel. Real impl: WebSocket-backed component.
  const messages = [
    { user: '@audiofan', text: 'Sound is amazing! 🔥' },
    { user: '@bkk_audio', text: 'Does it ship today?' },
    { user: '@deals_hunter', text: 'Drop code please 🙏' },
    { user: '@newbuyer', text: 'First time here, hi!' },
  ];

  return (
    <div className="flex h-72 flex-col rounded-lg border bg-muted/20 p-3">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Live chat
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto text-xs">
        {messages.map((m, i) => (
          <div key={i}>
            <span className="font-medium">{m.user}</span>{' '}
            <span className="text-muted-foreground">{m.text}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Say something..."
        className="mt-2 w-full rounded-md border bg-background px-3 py-1.5 text-xs"
      />
    </div>
  );
}
