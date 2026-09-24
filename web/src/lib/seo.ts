import type { Metadata } from "next";
import type { StructuredPage } from "@/lib/content-types";
import { site } from "@/lib/site";

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://peryton.space";

function normalizeSiteUrl(value: string): string {
  const url = new URL(value);
  if (url.hostname === "www.peryton.space") {
    url.hostname = "peryton.space";
  }
  return url.toString().replace(/\/$/, "");
}

export const siteUrl = normalizeSiteUrl(configuredSiteUrl);
export const defaultSocialImage = site.logo;

const pageDescriptions: Record<string, string> = {
  about:
    "Meet Peryton Space, the University of Surrey’s student-led rocketry and space society.",
  "contact-us":
    "Contact Peryton Space about membership, collaboration, sponsorship, or student space engineering at Surrey.",
  "member-zone":
    "Public workshop, course, and making resources for Peryton Space members and peer societies.",
  stagworks:
    "Explore Peryton Space projects beyond competitions, including high-altitude balloons, RF, composites, and electronics.",
  sponsorships:
    "Partner with Peryton Space to support student space engineering through funding, products, and careers engagement.",
};
const nonIndexableSlugs = new Set(["merch"]);

function textFromHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&(?:#39|apos);/g, "'")
    .replace(/&(?:#x2019|rsquo);/g, "’")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shorten(value: string, maxLength = 160): string {
  if (value.length <= maxLength) return value;
  const shortened = value.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 100 ? lastSpace : undefined)}…`;
}

export function getStructuredDescription(page: StructuredPage): string {
  const explicit = pageDescriptions[page.slug];
  if (explicit) return explicit;

  const richText = page.sections.find(
    (section) =>
      section.type === "richtext" && typeof section.props?.html === "string",
  );
  if (typeof richText?.props?.html === "string") {
    const text = textFromHtml(richText.props.html);
    if (text) return shorten(text);
  }
  return site.tagline;
}

export function canonicalPath(pathname: string): string {
  if (pathname === "/") return "/";
  return `/${pathname.replace(/^\/|\/$/g, "")}/`;
}

export function buildPageMetadata({
  title,
  description = site.tagline,
  pathname,
  index = true,
}: {
  title: string;
  description?: string;
  pathname: string;
  index?: boolean;
}): Metadata {
  const canonical = canonicalPath(pathname);
  return {
    title,
    description,
    alternates: { canonical },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url: canonical,
      images: [{ url: defaultSocialImage, alt: `${site.name} logo` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultSocialImage],
    },
  };
}

export function shouldIndexStructuredPage(page: StructuredPage): boolean {
  return (
    (page.status !== "placeholder" || page.slug === "member-zone") &&
    !nonIndexableSlugs.has(page.slug)
  );
}
