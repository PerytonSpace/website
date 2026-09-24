import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buildPageMetadata, siteUrl } from "@/lib/seo";
import { site, socialLinks } from "@/lib/site";
/* Scrape WP blocks first; globals (tokens + new chrome) always wins after. */
import "@/styles/scrape.css";
import "./globals.css";

/** Interim brand face — self-hosted via next/font (no Google runtime CSS). */
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const rootMetadata = buildPageMetadata({
  title: site.name,
  description: site.tagline,
  pathname: "/",
});

export const metadata: Metadata = {
  ...rootMetadata,
  metadataBase: new URL(siteUrl),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  icons: {
    icon: [{ url: site.icon, type: "image/png" }],
    apple: site.icon,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: site.name,
      url: `${siteUrl}/`,
      logo: new URL(site.logo, `${siteUrl}/`).toString(),
      sameAs: socialLinks.map((link) => link.href),
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: site.name,
      url: `${siteUrl}/`,
      description: site.tagline,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceMono.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <div className="wp-site-blocks">
          <a className="ps-skip-link" href="#wp--skip-link--target">
            Skip to content
          </a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
