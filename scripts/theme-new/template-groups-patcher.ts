/**
 * Patch `lib/templates/template-groups.ts` — append a new TemplateId to the
 * given group's array in `TEMPLATE_GROUPS_MAP`.
 *
 * The file uses a single-line array literal per group like:
 *   trust: ['classic', 'atelier-27'],
 *   neon: ['neon-festival'],
 *
 * Multi-line entries (wrapped to several lines like 'fashion-beauty') are
 * also supported: we find the group key, then locate the next `],` after
 * it, and insert before the closing bracket.
 */
import { readFileSync, writeFileSync } from 'node:fs';

export interface GroupsPatchOptions {
  filePath: string;
  themeId: string;
  group: string;
  dryRun: boolean;
}

export interface GroupsPatchResult {
  changed: boolean;
  reason?: string;
}

export function patchTemplateGroups(opts: GroupsPatchOptions): GroupsPatchResult {
  const src = readFileSync(opts.filePath, 'utf8');

  // The group key may be quoted (e.g. 'fashion-beauty':) or bare (trust:).
  // Match either form. We accept the whole array literal up to the next `],`.
  const groupKey = needsQuotedKey(opts.group) ? `'${opts.group}'` : opts.group;
  const altKey = needsQuotedKey(opts.group) ? opts.group : `'${opts.group}'`;

  const escaped = escapeRe(groupKey);
  const escapedAlt = escapeRe(altKey);
  const re = new RegExp(`(${escaped}|${escapedAlt})\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const match = src.match(re);
  if (!match) {
    throw new Error(
      `template-groups-patcher: could not find group key '${opts.group}' in TEMPLATE_GROUPS_MAP at ${opts.filePath}`
    );
  }

  const arrayBody = match[2];
  if (new RegExp(`['"]${escapeRe(opts.themeId)}['"]`).test(arrayBody)) {
    process.stdout.write(`  [template-groups.ts] '${opts.themeId}' already in '${opts.group}' — skip\n`);
    return { changed: false, reason: 'already-present' };
  }

  const trimmed = arrayBody.trim();
  let newArrayBody: string;
  if (trimmed.length === 0) {
    // Empty array.
    newArrayBody = `'${opts.themeId}'`;
  } else if (arrayBody.includes('\n')) {
    // Multi-line — preserve indent + comma layout.
    const lineMatch = arrayBody.match(/\n([ \t]+)/);
    const indent = lineMatch ? lineMatch[1] : '    ';
    const stripped = arrayBody.replace(/\s+$/, '');
    const needsComma = !/,\s*$/.test(stripped);
    newArrayBody = `${stripped}${needsComma ? ',' : ''}\n${indent}'${opts.themeId}',\n  `;
  } else {
    // Single line, simple append.
    const stripped = arrayBody.replace(/\s+$/, '');
    const needsComma = !/,\s*$/.test(stripped);
    newArrayBody = `${stripped}${needsComma ? ',' : ''} '${opts.themeId}'`;
  }

  const fullMatch = match[0];
  const newSegment = fullMatch.replace(/\[[\s\S]*?\]/, `[${newArrayBody}]`);
  const patched = src.replace(fullMatch, newSegment);

  if (patched === src) {
    return { changed: false, reason: 'no-change' };
  }

  if (opts.dryRun) {
    process.stdout.write(
      `  [template-groups.ts] would append '${opts.themeId}' to TEMPLATE_GROUPS_MAP.${opts.group}\n`
    );
    return { changed: true };
  }
  writeFileSync(opts.filePath, patched, 'utf8');
  process.stdout.write(
    `  [template-groups.ts] appended '${opts.themeId}' to TEMPLATE_GROUPS_MAP.${opts.group}\n`
  );
  return { changed: true };
}

function needsQuotedKey(group: string): boolean {
  // Object keys with dashes need quotes in TypeScript object literals.
  return group.includes('-');
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
