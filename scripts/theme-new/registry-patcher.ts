/**
 * Patch `lib/templates/registry.ts` — add an import block + new Template
 * entry for a freshly scaffolded theme.
 *
 * Insertion strategy:
 *   1. Append an `import { ... } from '@/components/storefront/themes/<id>/adapters';`
 *      block immediately AFTER the last `import { ... } from '@/components/storefront/themes/...';`
 *      line. (Matches the convention used by every existing theme.)
 *   2. Append a new entry inside the `export const templates: Record<...> = { ... };`
 *      object literal, just before the closing `};`.
 *
 * Both ops are skipped if the theme id already appears in the file.
 */
import { readFileSync, writeFileSync } from 'node:fs';

export interface RegistryPatchOptions {
  filePath: string;
  themeId: string;
  themeName: string;
  themeVibe: string;
  group: string;
  shellShape?: string;
  dryRun: boolean;
}

export interface RegistryPatchResult {
  changed: boolean;
  reason?: string;
}

export function patchRegistry(opts: RegistryPatchOptions): RegistryPatchResult {
  const src = readFileSync(opts.filePath, 'utf8');
  const { themeId } = opts;

  // Idempotency: if the import path appears, skip.
  const importPath = `@/components/storefront/themes/${themeId}/adapters`;
  if (src.includes(importPath)) {
    process.stdout.write(
      `  [registry.ts] '${themeId}' already imported — skip\n`
    );
    return { changed: false, reason: 'already-present' };
  }

  const v = deriveIdVariants(themeId);

  const importBlock = buildImportBlock(themeId, v);
  const entryBlock = buildEntryBlock(opts, v);

  // 1. Find last theme-adapter import line.
  const importRe =
    /^import\s+\{[\s\S]*?\}\s+from\s+'@\/components\/storefront\/themes\/[a-z0-9-]+\/adapters';\s*$/gm;
  const importMatches = [...src.matchAll(importRe)];
  if (importMatches.length === 0) {
    throw new Error(
      `registry-patcher: could not find any theme adapter import to anchor after in ${opts.filePath}`
    );
  }
  const lastImport = importMatches[importMatches.length - 1];
  const lastImportEnd = (lastImport.index ?? 0) + lastImport[0].length;
  const withImports = src.slice(0, lastImportEnd) + '\n\n' + importBlock + src.slice(lastImportEnd);

  // 2. Find closing of templates object literal:
  //     export const templates: Record<TemplateId, Template> = {
  //       ...
  //     };
  // We look for the line `};` that closes the templates object.
  const closingRe =
    /(export const templates: Record<TemplateId, Template> = \{[\s\S]*?)\n\};\s*$/m;
  const close = withImports.match(closingRe);
  if (!close) {
    throw new Error(
      `registry-patcher: could not find closing '};' of templates object in ${opts.filePath}`
    );
  }
  const patched = withImports.replace(closingRe, `$1\n\n${entryBlock}\n};\n`);

  if (patched === withImports) {
    return { changed: false, reason: 'no-change' };
  }

  if (opts.dryRun) {
    process.stdout.write(
      `  [registry.ts] would add import block + entry for '${themeId}'\n`
    );
    return { changed: true };
  }
  writeFileSync(opts.filePath, patched, 'utf8');
  process.stdout.write(`  [registry.ts] added import block + entry for '${themeId}'\n`);
  return { changed: true };
}

interface Variants {
  kebab: string;
  snake: string;
  pascal: string;
}

function deriveIdVariants(id: string): Variants {
  const parts = id.split('-').filter(Boolean);
  const pascal = parts.map((p) => p[0].toUpperCase() + p.slice(1)).join('');
  return { kebab: id, snake: parts.join('_'), pascal };
}

function buildImportBlock(themeId: string, v: Variants): string {
  const P = v.pascal;
  const s = v.snake;
  return [
    `import {`,
    `  ${P}HeaderAdapter,`,
    `  ${P}FooterAdapter,`,
    `  ${P}StripAdapter,`,
    `  ${P}HomepageAdapter,`,
    `  ${P}AboutAdapter,`,
    `  ${P}HelpAdapter,`,
    `  ${s}_Catalog,`,
    `  ${s}_ProductDetail,`,
    `  ${s}_Cart,`,
    `  ${s}_Checkout,`,
    `  ${s}_Contact,`,
    `} from '@/components/storefront/themes/${themeId}/adapters';`,
  ].join('\n');
}

function buildEntryBlock(opts: RegistryPatchOptions, v: Variants): string {
  const P = v.pascal;
  const s = v.snake;
  const desc = opts.themeVibe.replace(/'/g, "\\'");
  const shellLine = opts.shellShape
    ? `      shellShape: '${opts.shellShape}',\n`
    : '';
  return [
    `  '${opts.themeId}': {`,
    `    id: '${opts.themeId}',`,
    `    name: '${opts.themeName.replace(/'/g, "\\'")}',`,
    `    description: '${desc}',`,
    `    group: '${opts.group}',`,
    `    behavior: { bottomNav: 'visible' },`,
    `    chrome: {`,
    `      Header: ${P}HeaderAdapter,`,
    `      Footer: ${P}FooterAdapter,`,
    `      AnnouncementStrip: ${P}StripAdapter,`,
    shellLine ? shellLine.replace(/\n$/, '') : null,
    `    },`,
    `    pages: {`,
    `      home: ${P}HomepageAdapter,`,
    `      catalog: ${s}_Catalog,`,
    `      pdp: ${s}_ProductDetail,`,
    `      cart: ${s}_Cart,`,
    `      checkout: ${s}_Checkout,`,
    `      about: ${P}AboutAdapter,`,
    `      help: ${P}HelpAdapter,`,
    `      contact: ${s}_Contact,`,
    `    },`,
    `  },`,
  ]
    .filter((l): l is string => l !== null)
    .join('\n');
}
