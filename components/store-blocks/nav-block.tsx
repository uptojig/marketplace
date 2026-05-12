'use client';

import { useState } from 'react';
import { ArrowUpDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BlockProps } from '@/lib/templates/renderer';
import type { Store } from '@/lib/templates/types';

export function NavBlock({ block, store }: BlockProps) {
  switch (block.variant) {
    case 'tabs':
      return <TabsNav tabs={(block.data?.tabs as string[]) ?? ['home', 'products']} />;
    case 'sticky-chips':
      return <ChipsNav store={store} />;
    case 'sidebar':
      return null;
    case 'none':
      return null;
    default:
      return <TabsNav tabs={['home', 'products']} />;
  }
}

function TabsNav({ tabs }: { tabs: string[] }) {
  const [active, setActive] = useState(tabs[0] ?? 'home');

  return (
    <Tabs
      value={active}
      onValueChange={setActive}
      className="sticky top-0 z-10 border-b bg-background px-4"
    >
      <TabsList className="h-auto bg-transparent p-0">
        {tabs.map((t) => (
          <TabsTrigger
            key={t}
            value={t}
            className="rounded-none border-b-2 border-transparent capitalize data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {t}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function ChipsNav({ store }: { store: Store }) {
  return (
    <div className="sticky top-0 z-10 border-b bg-background px-4 py-2">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button variant="secondary" size="sm" className="shrink-0 rounded-full">
          <ArrowUpDown className="mr-1 h-3 w-3" /> Sort
        </Button>
        <Button variant="outline" size="sm" className="shrink-0 rounded-full">
          <Filter className="mr-1 h-3 w-3" /> Filter
        </Button>
        {store.collections.slice(0, 6).map((c) => (
          <Button key={c.id} variant="outline" size="sm" className="shrink-0 rounded-full">
            {c.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
