#!/usr/bin/env node
/**
 * Write robots.txt, sitemap.xml, and Cloudflare _headers into web/public/
 * (copied into out/ on next build).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(__dirname, "..");
const PUBLIC = path.join(WEB, "public");
const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://peryton.space";
const parsedSiteUrl = new URL(configuredSiteUrl);
if (parsedSiteUrl.hostname === "www.peryton.space") {
  parsedSiteUrl.hostname = "peryton.space";
}
const SITE = parsedSiteUrl.toString().replace(/\/$/, "");
const SITEMAP_EXCLUDE = new Set(["merch"]);

function collectRoutes() {
  const routes = new Set(["/"]);

  // Canonical structured pages only. Scraped WordPress paths include aliases,
  // draft URLs, and thin legacy placeholders, so they are intentionally absent.
  const pagesRoot = path.join(WEB, "content", "pages");
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(p);
      } else if (ent.name.endsWith(".json")) {
        const page = JSON.parse(fs.readFileSync(p, "utf8"));
        const isIndexable =
          (page.status === "published" || page.slug === "member-zone") &&
          !SITEMAP_EXCLUDE.has(page.slug);
        if (
          isIndexable &&
          typeof page.slug === "string" &&
          page.slug &&
          !page.slug.startsWith("draft-")
        ) {
          routes.add(`/${page.slug.replace(/^\/|\/$/g, "")}/`);
        }
      }
    }
  }
  walk(pagesRoot);

  const missionsPath = path.join(WEB, "content", "missions", "index.json");
  const missions = JSON.parse(fs.readFileSync(missionsPath, "utf8")).missions;
  for (const mission of missions) {
    routes.add(`/${mission.hubSlug}/`);
    for (const year of mission.years || []) {
      if (year.status === "published" || year.status === "live") {
        routes.add(`/${mission.hubSlug}/${year.id}/`);
      }
    }
  }

  return [...routes].sort((a, b) => a.localeCompare(b));
}

function main() {
  fs.mkdirSync(PUBLIC, { recursive: true });

  fs.writeFileSync(
    path.join(PUBLIC, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
  );

  const routes = collectRoutes();
  const urls = routes
    .map(
      (r) => `  <url>
    <loc>${SITE}${r === "/" ? "/" : r}</loc>
  </url>`,
    )
    .join("\n");
  fs.writeFileSync(
    path.join(PUBLIC, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  );

  fs.writeFileSync(
    path.join(PUBLIC, "_headers"),
    `# Cloudflare Pages headers — see .planning/docs/HOSTING.md
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/wp-content/uploads/*
  Cache-Control: public, max-age=604800

/
  Cache-Control: public, max-age=0, must-revalidate
`,
  );

  console.log(
    `SEO: robots.txt + sitemap.xml (${routes.length} urls) + _headers → public/`,
  );
}

main();
