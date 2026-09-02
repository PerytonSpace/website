/** Project Pages path (`/website`) or empty for local / Cloudflare root. */
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(
  /\/$/,
  "",
);

export function withBase(path: string): string {
  if (!path) return path;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//") ||
    path.startsWith("data:") ||
    path.startsWith("mailto:") ||
    path.startsWith("#")
  ) {
    return path;
  }
  if (!path.startsWith("/")) return path;
  if (!basePath) return path;
  if (path === basePath || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}

/** Prefix root-relative src/href/url() in scrape or richtext HTML. */
export function withBaseHtml(html: string): string {
  if (!basePath || !html) return html;
  return html
    .replace(
      /\b((?:src|href|poster)=["'])(\/[^"']*)/gi,
      (full, attr: string, url: string) => {
        if (url.startsWith("//")) return full;
        return `${attr}${withBase(url)}`;
      },
    )
    .replace(/url\((["']?)(\/[^"')]+)\1\)/g, (full, quote: string, url: string) => {
      if (url.startsWith("//")) return full;
      return `url(${quote}${withBase(url)}${quote})`;
    });
}
