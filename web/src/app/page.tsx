import type { Metadata } from "next";
import { HomeBodyClass } from "@/components/HomeBodyClass";
import { HomeSnap } from "@/components/HomeSnap";
import { getHomePage } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: getHomePage()
    .title.replace(/ — Peryton Space$/, "")
    .replace(/ – Peryton Space$/, ""),
  description: site.tagline,
  pathname: "/",
});

export default function HomePage() {
  return (
    <>
      <HomeBodyClass />
      <HomeSnap />
    </>
  );
}
