import { type BlockComponent, cuteRegistry } from "./themes/cute";
import { minimalRegistry } from "./themes/minimal";
import type { GeneratedPageSchema } from "@/lib/agent-service";

// Map v3 design families (A-I) to the closest available theme registry.
// As new family-specific registries are built, they replace minimalRegistry here.
const FAMILY_MAP: Record<string, Record<string, BlockComponent>> = {
  A: minimalRegistry,  // Editorial Minimal Warm
  B: cuteRegistry,     // Editorial Soft Feminine
  C: minimalRegistry,  // Luxury Heritage Gold
  D: minimalRegistry,  // Industrial Masculine
  E: minimalRegistry,  // Cyberpunk Gaming Neon
  F: minimalRegistry,  // Sport Editorial Action
  G: minimalRegistry,  // Botanical Lifestyle Premium
  H: minimalRegistry,  // Cozy Niche Skeumorphism
  I: cuteRegistry,     // Playful Mass Commerce
};

// Legacy theme registries (v2)
const THEME_MAP: Record<string, Record<string, BlockComponent>> = {
  cute: cuteRegistry,
  minimal: minimalRegistry,
};

function resolveRegistry(schema: GeneratedPageSchema): Record<string, BlockComponent> {
  // v3 designFamily takes precedence
  if (schema.designFamily && FAMILY_MAP[schema.designFamily]) {
    return FAMILY_MAP[schema.designFamily];
  }
  // v2 themeVariant fallback
  if (schema.themeVariant && THEME_MAP[schema.themeVariant]) {
    return THEME_MAP[schema.themeVariant];
  }
  // Also check if themeVariant stores a v3 family letter (from DB)
  if (schema.themeVariant && FAMILY_MAP[schema.themeVariant]) {
    return FAMILY_MAP[schema.themeVariant];
  }
  return minimalRegistry;
}

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
  const registry = resolveRegistry(schema);
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
