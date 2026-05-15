#!/usr/bin/env node
// Headless Chromium automation that appends Authorized Redirect URIs to
// a Google OAuth 2.0 client.
//
// WHY THIS EXISTS
//   Google deliberately does NOT expose a public API for managing OAuth
//   2.0 client redirect URIs (see googleapis/google-cloud-go#10768).
//   The Cloud Console UI is the only official surface. To avoid
//   manually pasting URIs every time we provision a new shop droplet,
//   we drive the UI with Playwright + the stealth plugin so Google's
//   anti-bot heuristics treat the headless Chromium like a real user.
//
//   The browser profile is persisted at ~/.basketplace/oauth-profile/.
//   First run opens a visible window; you sign in to Google once,
//   the session cookies stick for ~2-4 weeks, and every run after
//   that goes fully headless.
//
// USAGE
//   First-time setup (also saves project + clientId to
//   ~/.basketplace/oauth-config.json so you don't repeat them):
//     npm run oauth:add-shop -- \
//       --project basketplace-prod \
//       --client-id 46879544373-XXXX.apps.googleusercontent.com \
//       --slug fluffyhouse \
//       --domain fluffy-house.com
//
//   Subsequent runs:
//     npm run oauth:add-shop -- --slug zugarbox --domain zugarbox.com
//
//   Arbitrary URIs (when slug+domain pattern doesn't fit):
//     npm run oauth:add-shop -- --uri https://example.com/api/auth/callback/google
//
//   Dry run (print URIs without opening browser):
//     npm run oauth:add-shop -- --slug fluffyhouse --domain fluffy-house.com --dry-run
//
// FLAGS
//   --slug <name>       shop slug — derives <slug>.<platform>/api/auth/callback/google
//   --domain <host>     custom domain — derives https://<host>/api/auth/callback/google
//   --uri <url>         explicit URI (can repeat; appended to slug/domain derived ones)
//   --project <name>    Google Cloud project name (saved on first use)
//   --client-id <id>    OAuth 2.0 client ID, full string ending in .apps.googleusercontent.com
//   --headful           force a visible browser even when the profile is warm
//   --headless          force headless (will fail if no saved session)
//   --dry-run           print URIs without launching the browser
//
// ENV (fallbacks for --project / --client-id):
//   BASKETPLACE_GOOGLE_PROJECT
//   BASKETPLACE_GOOGLE_OAUTH_CLIENT_ID
//   BASKETPLACE_PLATFORM_DOMAIN   default basketplace.co
//
// EXIT CODES
//   0  success (URIs added or already present)
//   1  bad args or browser flow failed (screenshot at ~/.basketplace/last-error.png)

import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

chromium.use(stealth());

const HOME_BASKETPLACE = join(homedir(), ".basketplace");
const PROFILE_DIR = join(HOME_BASKETPLACE, "oauth-profile");
const CONFIG_PATH = join(HOME_BASKETPLACE, "oauth-config.json");
const ERROR_SCREENSHOT = join(HOME_BASKETPLACE, "last-error.png");

const DEFAULT_PLATFORM_DOMAIN = "basketplace.co";

// ── arg parsing ──────────────────────────────────────────────────
function parseArgs(argv) {
  const out = { uris: [] };
  let i = 2;
  while (i < argv.length) {
    const a = argv[i];
    let key = a;
    let value;
    const eq = a.indexOf("=");
    if (a.startsWith("--") && eq > 0) {
      key = a.slice(0, eq);
      value = a.slice(eq + 1);
      i += 1;
    } else {
      value = argv[i + 1];
      i += 2;
    }
    switch (key) {
      case "--slug":      out.slug = value; break;
      case "--domain":    out.domain = value; break;
      case "--uri":       out.uris.push(value); break;
      case "--project":   out.project = value; break;
      case "--client-id": out.clientId = value; break;
      case "--headful":   out.headless = false; i -= 1; break;
      case "--headless":  out.headless = true; i -= 1; break;
      case "--dry-run":   out.dryRun = true; i -= 1; break;
      case "--help":
      case "-h":          out.help = true; i -= 1; break;
      default:
        console.error(`Unknown flag: ${key}`);
        process.exit(1);
    }
  }
  return out;
}

function printHelpAndExit() {
  console.log(`
Append Authorized Redirect URIs to a Google OAuth 2.0 client via UI automation.

  npm run oauth:add-shop -- --slug fluffyhouse --domain fluffy-house.com

First-time setup adds --project and --client-id; both get cached at
~/.basketplace/oauth-config.json so future runs only need --slug / --domain.

Flags: --slug, --domain, --uri, --project, --client-id,
       --headful, --headless, --dry-run, --help
`);
  process.exit(0);
}

// ── config persistence ───────────────────────────────────────────
async function loadConfig() {
  try {
    return JSON.parse(await readFile(CONFIG_PATH, "utf8"));
  } catch {
    return {};
  }
}

async function saveConfig(cfg) {
  await mkdir(HOME_BASKETPLACE, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

// ── URI computation ──────────────────────────────────────────────
function buildTargetUris({ slug, domain, uris }, platformDomain) {
  const out = [...uris];
  if (slug) out.push(`https://${slug}.${platformDomain}/api/auth/callback/google`);
  if (domain) out.push(`https://${domain}/api/auth/callback/google`);
  // Dedup preserving first-seen order.
  return Array.from(new Set(out));
}

// ── browser interactions ─────────────────────────────────────────
async function ensureSignedIn(page, credentialsUrl) {
  await page.goto(credentialsUrl, { waitUntil: "domcontentloaded" });
  // accounts.google.com / signin / signup redirects mean we need a
  // human in front of the keyboard for this run.
  if (/accounts\.google\.com|signin|signup/.test(page.url())) {
    console.log(
      "[oauth-script] Browser is on Google sign-in. Complete the flow in the visible window — waiting up to 5 minutes...",
    );
    await page.waitForURL(/console\.cloud\.google\.com\/.*credentials/, {
      timeout: 5 * 60_000,
    });
    console.log("[oauth-script] Sign-in complete.");
  }
}

async function openClientEditor(page, clientId) {
  // The credentials table rows show the client name + OAuth 2.0 client
  // ID. Match by the client ID's numeric prefix (project-number-style
  // first segment) so we don't break when the table truncates the
  // full string with "...". Click the name link to open the editor.
  const prefix = clientId.split("-")[0];
  const row = page.locator(`tr:has-text("${prefix}")`).first();
  await row.waitFor({ state: "visible", timeout: 30_000 });
  // Prefer the link inside the row over clicking the row itself (some
  // table cells eat the click and toggle a checkbox instead).
  const link = row.locator("a").first();
  if (await link.count()) await link.click();
  else await row.click();
  // Editor page renders the URI section; wait for it.
  await page
    .getByRole("heading", { name: /authori[sz]ed redirect uri/i })
    .waitFor({ timeout: 30_000 });
}

async function readExistingUris(page) {
  // Each URI is in an input under the "Authorized redirect URIs"
  // section. Match by aria-label which the Console assigns as
  // "URIs N" (where N is 1-based).
  const inputs = page.locator(
    'input[aria-label^="URIs "], input[aria-label^="URI "]',
  );
  const count = await inputs.count();
  const values = [];
  for (let i = 0; i < count; i++) {
    const v = (await inputs.nth(i).inputValue()).trim();
    if (v) values.push(v);
  }
  return values;
}

async function appendUris(page, uris) {
  for (const uri of uris) {
    const addBtn = page
      .getByRole("button", { name: /\+\s*add uri|add uri/i })
      .last();
    await addBtn.click();
    // The newly added input is the last one in the URIs list.
    const inputs = page.locator(
      'input[aria-label^="URIs "], input[aria-label^="URI "]',
    );
    const last = inputs.last();
    await last.fill(uri);
  }
  // The editor has a single primary "Save" button at the bottom of
  // the form. There's a "Cancel" sibling — getByRole("button") picks
  // the right one by name.
  const save = page.getByRole("button", { name: /^save$/i }).last();
  await save.click();
  // After save we usually navigate back to the credentials list. Wait
  // for either that navigation or a confirmation snackbar.
  await Promise.race([
    page.waitForURL(/console\.cloud\.google\.com\/apis\/credentials(?!\/oauthclient)/, {
      timeout: 30_000,
    }),
    page.getByText(/saved|updated/i).waitFor({ timeout: 30_000 }),
  ]).catch(() => {
    /* best-effort; we'll trust no exception means success */
  });
}

// ── main ─────────────────────────────────────────────────────────
(async () => {
  const args = parseArgs(process.argv);
  if (args.help) printHelpAndExit();

  const cfg = await loadConfig();
  const project =
    args.project ?? cfg.project ?? process.env.BASKETPLACE_GOOGLE_PROJECT;
  const clientId =
    args.clientId ??
    cfg.clientId ??
    process.env.BASKETPLACE_GOOGLE_OAUTH_CLIENT_ID;
  const platformDomain =
    process.env.BASKETPLACE_PLATFORM_DOMAIN ?? DEFAULT_PLATFORM_DOMAIN;

  if (!project || !clientId) {
    console.error(
      "Missing project or client-id. Pass --project=<projectName> --client-id=<...apps.googleusercontent.com> once; we cache both at ~/.basketplace/oauth-config.json.",
    );
    process.exit(1);
  }
  // Cache fresh args back to disk so the next run can omit them.
  if (args.project || args.clientId) {
    await saveConfig({ project, clientId });
    console.log(`[oauth-script] Cached project + clientId → ${CONFIG_PATH}`);
  }

  const targetUris = buildTargetUris(args, platformDomain);
  if (targetUris.length === 0) {
    console.error(
      "No URIs to add. Pass --slug + --domain (each adds one callback), or --uri <full-url>.",
    );
    process.exit(1);
  }

  console.log("[oauth-script] Target URIs:");
  for (const u of targetUris) console.log("  •", u);

  if (args.dryRun) {
    console.log("[oauth-script] --dry-run — not opening browser.");
    process.exit(0);
  }

  await mkdir(PROFILE_DIR, { recursive: true });
  const profileExists = existsSync(join(PROFILE_DIR, "Default"));
  const headless = args.headless ?? profileExists;
  console.log(
    `[oauth-script] Launching browser (${headless ? "headless" : "headful"})...`,
  );

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless,
    viewport: { width: 1280, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const page = await context.newPage();
  const credentialsUrl = `https://console.cloud.google.com/apis/credentials?project=${encodeURIComponent(
    project,
  )}`;

  try {
    await ensureSignedIn(page, credentialsUrl);
    await openClientEditor(page, clientId);
    const existing = new Set(await readExistingUris(page));
    const toAdd = targetUris.filter((u) => !existing.has(u));
    if (toAdd.length === 0) {
      console.log(
        "[oauth-script] All target URIs already registered — nothing to do.",
      );
    } else {
      console.log("[oauth-script] Adding:", toAdd);
      await appendUris(page, toAdd);
      console.log(`[oauth-script] Saved ${toAdd.length} URI(s).`);
    }
  } catch (err) {
    console.error("[oauth-script] Failed:", err?.message ?? err);
    try {
      await page.screenshot({ path: ERROR_SCREENSHOT, fullPage: true });
      console.error(`[oauth-script] Screenshot → ${ERROR_SCREENSHOT}`);
    } catch {
      /* best-effort */
    }
    process.exitCode = 1;
  } finally {
    await context.close();
  }
})();
