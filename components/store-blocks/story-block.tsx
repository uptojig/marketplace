import Image from 'next/image';
import { Quote } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import type { BlockProps } from '@/lib/templates/renderer';
import type { Store } from '@/lib/templates/types';

export function StoryBlock({ block, store }: BlockProps) {
  switch (block.variant) {
    case 'inline':
      return <InlineStory store={store} />;
    case 'narrative-blocks':
      return <NarrativeBlocks store={store} />;
    default:
      return null;
  }
}

function InlineStory({ store }: { store: Store }) {
  return (
    <div className="border-y bg-muted/30 px-4 py-6">
      <Quote className="mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-sm leading-relaxed">
        {store.description ?? 'A small studio crafting each piece with care.'}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">— {store.name}</p>
    </div>
  );
}

function NarrativeBlocks({ store }: { store: Store }) {
  // Real impl: pull from store.story (typed config). Demo content here.
  const panels = [
    {
      title: 'Our origin',
      body: 'Founded with a simple belief: great products start with great stories.',
    },
    {
      title: 'How we craft',
      body: 'Each piece passes through three hands before reaching yours. Slow, deliberate, honest.',
    },
    {
      title: 'Where we go',
      body: "We're building something that lasts. Thanks for being part of it.",
    },
  ];

  return (
    <div className="space-y-6 px-4 py-8">
      {panels.map((p, i) => (
        <div key={i} className="space-y-2">
          {i === 0 && store.branding.portraitUrl && (
            <AspectRatio ratio={3 / 4} className="mb-4">
              <Image
                src={store.branding.portraitUrl}
                alt={store.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </AspectRatio>
          )}
          <h3 className="text-lg tracking-wide">{p.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
        </div>
      ))}
    </div>
  );
}
