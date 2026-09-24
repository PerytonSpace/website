#!/usr/bin/env python3
"""Rebuild web/src/app/favicon.ico from the header logo (`site.logo`).

Run by hand (`python3 scripts/make-favicon.py`, needs Pillow) whenever the
logo changes — the tab mark must stay the same asset the header shows.
The mark is white line art on transparency, so it is flattened onto the site
background (`--ps-bg`, black) to stay visible in light browser chrome.
"""

import pathlib
import sys

from PIL import Image

WEB = pathlib.Path(__file__).resolve().parent.parent
LOGO = WEB / "public/wp-content/uploads/2024/01/transparentlogo.png"
ICO = WEB / "src/app/favicon.ico"
BACKGROUND = (0, 0, 0, 255)
SIZES = [16, 32, 48, 64, 128, 256]
MARGIN = 0.05
"""Below this size the downscaled hairlines wash out, so lift their alpha."""
THIN_LINE_SIZE = 48
ALPHA_GAMMA = 0.6


def square_mark(logo: Image.Image, size: int) -> Image.Image:
    inner = round(size * (1 - 2 * MARGIN))
    scale = min(inner / logo.width, inner / logo.height)
    mark = logo.resize(
        (max(1, round(logo.width * scale)), max(1, round(logo.height * scale))),
        Image.LANCZOS,
    )

    if size <= THIN_LINE_SIZE:
        alpha = mark.getchannel("A")
        mark.putalpha(alpha.point(lambda v: round(255 * (v / 255) ** ALPHA_GAMMA)))

    canvas = Image.new("RGBA", (size, size), BACKGROUND)
    canvas.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    return canvas


def main() -> int:
    if not LOGO.exists():
        print(f"Logo missing: {LOGO} (run `npm run sync-media` first)")
        return 1

    logo = Image.open(LOGO).convert("RGBA")
    logo = logo.crop(logo.getbbox())
    marks = [square_mark(logo, size) for size in sorted(SIZES, reverse=True)]

    marks[0].save(
        ICO,
        format="ICO",
        sizes=[mark.size for mark in marks],
        append_images=marks[1:],
    )
    print(f"Wrote {ICO.relative_to(WEB)} from {LOGO.relative_to(WEB)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
