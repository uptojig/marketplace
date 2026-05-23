/**
 * Patch `lib/templates/types.ts` — append a new `TemplateId` union member.
 *
 * The file currently has a `TemplateId` union with one entry per line and a
 * trailing semicolon on its own line. We locate the closing `;` of that
 * union and insert a new ` | '<id>'` line above it.
 */
import { readFileSync, writeFileSync } from 'node:fs';

export interface TypesPatchOptions {
  filePath: string;
  themeId: string;
  dryRun: boolean;
}

export interface TypesPatchResult {
  changed: boolean;
  reason?: string;
}

/**
 * Match block:
 *   export type TemplateId =
 *     | 'handmade'
 *     | ...
 *     | 'neon-festival';
 */
const TEMPLATE_ID_RE = /export type TemplateId =\s*([\s\S]*?);/;

export function patchTypes(opts: TypesPatchOptions): TypesPatchResult {
  const src = readFileSync(opts.filePath, 'utf8');

  const match = src.match(TEMPLATE_ID_RE);
  if (!match) {
    throw new Error(`types-patcher: could not find 'export type TemplateId = ...' block in ${opts.filePath}`);
  }

  const body = match[1];
  if (new RegExp(`\\|\\s*'${escapeRe(opts.themeId)}'`).test(body)) {
    process.stdout.write(`  [types.ts] '${opts.themeId}' already present in TemplateId union — skip\n`);
    return { changed: false, reason: 'already-present' };
  }

  // Find indentation of an existing union member, fallback to 2 spaces.
  const memberMatch = body.match(/\n([ \t]+)\|\s*'/);
  const indent = memberMatch ? memberMatch[1] : '  ';
  const insertion = `\n${indent}| '${opts.themeId}'`;

  // Replace the entire match by appending `insertion` before the closing `;`.
  const fullMatch = match[0];
  const newBlock = fullMatch.replace(/;\s*$/, `${insertion};`);
  const patched = src.replace(fullMatch, newBlock);

  if (patched === src) {
    return { changed: false, reason: 'no-change' };
  }

  if (opts.dryRun) {
    process.stdout.write(`  [types.ts] would append '| ${opts.themeId}' to TemplateId union\n`);
    return { changed: true };
  }
  writeFileSync(opts.filePath, patched, 'utf8');
  process.stdout.write(`  [types.ts] appended '| ${opts.themeId}' to TemplateId union\n`);
  return { changed: true };
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
