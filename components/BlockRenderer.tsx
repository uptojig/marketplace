import { type BlockComponent, cuteRegistry } from "./themes/cute";
import { minimalRegistry } from "./themes/minimal";
import type { GeneratedPageSchema } from "@/lib/agent-service";

const REGISTRIES: Record<GeneratedPageSchema["themeVariant"], Record<string, BlockComponent>> = {
  cute: cuteRegistry,
  minimal: minimalRegistry,
};

function UnknownBlock({
  blockType,
  content,
}: {
  blockType: string;
  content: unknown;
}) {
  // Visible-but-quiet fallback so an unrecognized block doesn't disappear
  // silently — the agent might emit a new blockType before we register it.
  return (
    <div className="rounded-md border border-dashed border-amber-400 bg-amber-50 p-3 text-xs">
      <p className="font-mono text-amber-800">
        unknown blockType: <span className="font-bold">{blockType}</span>
      </p>
      <pre className="mt-1 overflow-x-auto text-[10px] text-amber-700">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}

export function BlockRenderer({ schema }: { schema: GeneratedPageSchema }) {
  const registry = REGISTRIES[schema.themeVariant] ?? minimalRegistry;
  return (
    <div className="space-y-6">
      {schema.blocks.map((b, i) => {
        const Comp = registry[b.blockType];
        if (!Comp) return <UnknownBlock key={i} blockType={b.blockType} content={b.content} />;
        return <Comp key={i} content={b.content} />;
      })}
    </div>
  );
}
