import type { CSSProperties } from "react";

/** Dark overlay + photo fill for elevated cards. Pair with `.ps-card-cover`. */
export function cardCoverStyle(src?: string | null): CSSProperties | undefined {
  if (!src) return undefined;
  return { backgroundImage: `url("${src}")` };
}

export function cardCoverClass(src?: string | null): string {
  return src ? "ps-card-cover" : "";
}
