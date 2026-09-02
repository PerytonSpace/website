import type { CSSProperties } from "react";
import { withBase } from "@/lib/basePath";

/** Dark overlay + photo fill for elevated cards. Pair with `.ps-card-cover`. */
export function cardCoverStyle(src?: string | null): CSSProperties | undefined {
  if (!src) return undefined;
  return { backgroundImage: `url("${withBase(src)}")` };
}

/** Cover as a CSS variable so a ::after layer can blur independently of text. */
export function cardCoverVars(src?: string | null): CSSProperties | undefined {
  if (!src) return undefined;
  return { ["--ps-cover" as string]: `url("${withBase(src)}")` };
}

export function cardCoverClass(src?: string | null): string {
  return src ? "ps-card-cover" : "";
}
