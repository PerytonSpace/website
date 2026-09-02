/**
 * After `next build`, prefix public `/wp-content` and `/media/covers`
 * so project GitHub Pages (`/website`) can load them. Skips `/_next/static/media`.
 * No-ops without a base path.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(WEB, "out");

function rewrite(text) {
  const escaped = BASE.replaceAll("/", "\\/");
  return text
    .replaceAll(`${BASE}/wp-content`, "\0WP\0")
    .replaceAll(`${escaped}\\/wp-content`, "\0WPE\0")
    .replaceAll("/wp-content", `${BASE}/wp-content`)
    .replaceAll("\\/wp-content", `${escaped}\\/wp-content`)
    .replaceAll("\0WP\0", `${BASE}/wp-content`)
    .replaceAll("\0WPE\0", `${escaped}\\/wp-content`)
    .replace(
      /(?<!_next\/static)\/media\//g,
      (match, offset, src) => {
        const before = src.slice(Math.max(0, offset - 20), offset);
        if (before.endsWith(`${BASE}`)) return match;
        return `${BASE}/media/`;
      },
    )
    .replace(
      /(?<!_next\\\/static)\\\/media\\\//g,
      (match, offset, src) => {
        const before = src.slice(Math.max(0, offset - 24), offset);
        if (before.endsWith(escaped)) return match;
        return `${escaped}\\/media\\/`;
      },
    );
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p);
      continue;
    }
    if (!/\.(html|css|js|xml|txt|json)$/.test(ent.name)) continue;
    const before = fs.readFileSync(p, "utf8");
    const after = rewrite(before);
    if (after !== before) fs.writeFileSync(p, after);
  }
}

if (!BASE) {
  process.exit(0);
}
if (!fs.existsSync(OUT)) {
  console.warn("prefix-static-assets: no web/out — skip");
  process.exit(0);
}
walk(OUT);
console.log(`SEO/assets: prefixed /wp-content and /media with ${BASE}`);
