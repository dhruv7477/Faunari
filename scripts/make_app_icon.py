"""Generate the Faunari app icon set (launcher, adaptive, splash) into mobile/assets/.

A minimal, geometric serpentine mark — thick tapering S-curve with an eye dot — in cream on the
brand's deep forest green. Drawn at 4x and downscaled for smooth edges.

    python scripts/make_app_icon.py
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "mobile" / "assets"

FOREST = (18, 53, 36, 255)  # #123524 — matches the app header
CREAM = (242, 239, 228, 255)
TONGUE = (192, 57, 43, 255)

SIZE = 1024
SS = 4  # supersampling factor


def _s_curve_points(n: int = 300) -> list[tuple[float, float, float]]:
    """(x, y, radius) samples along a centered symmetric S-curve, head at top, tapering tail."""
    pts = []
    for i in range(n):
        t = i / (n - 1)
        y = 0.26 + 0.56 * t  # vertical span, leaving headroom for the tongue
        envelope = min(1.0, t / 0.30) ** 0.8  # straight neck below the head, then swing
        x = 0.50 + 0.16 * envelope * math.sin(2.0 * math.pi * t)  # full sine period = symmetric "S"
        r = 0.068 * (1.0 - 0.70 * t)  # taper: thick behind the head -> slim tail
        pts.append((x, y, r))
    return pts


def _draw_mark(draw: ImageDraw.ImageDraw, s: int) -> None:
    """Serpentine body + front-facing head with two eyes + tongue, in canvas fractions * s."""
    pts = _s_curve_points()
    for x, y, r in pts:
        cx, cy, cr = x * s, y * s, r * s
        draw.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=CREAM)

    # front-facing head centered on the curve start (top-center)
    hx, hy, hr = pts[0][0] * s, pts[0][1] * s, 0.096 * s
    # forked tongue flicking straight up from the mouth (drawn first, behind the head edge)
    w = int(0.013 * s)
    tip_y = hy - hr - 0.058 * s
    draw.line([hx, hy - hr + 0.02 * s, hx, tip_y], fill=TONGUE, width=w)
    draw.line([hx, tip_y, hx - 0.024 * s, tip_y - 0.028 * s], fill=TONGUE, width=w)
    draw.line([hx, tip_y, hx + 0.024 * s, tip_y - 0.028 * s], fill=TONGUE, width=w)
    draw.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=CREAM)
    # two eyes, symmetric
    for dx in (-0.036, 0.036):
        ex, ey, er = hx + dx * s, hy - 0.020 * s, 0.0155 * s
        draw.ellipse([ex - er, ey - er, ex + er, ey + er], fill=FOREST)


def _render_mark(scale: float = 1.0) -> Image.Image:
    """Transparent 1024px canvas with the mark, optionally scaled about the center."""
    s = SIZE * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    _draw_mark(ImageDraw.Draw(img), s)
    if scale != 1.0:
        box = int(s * scale)
        mark = img.resize((box, box), Image.LANCZOS)
        img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        img.paste(mark, ((s - box) // 2, (s - box) // 2), mark)
    return img.resize((SIZE, SIZE), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # launcher icon: full-bleed forest background + mark
    icon = Image.new("RGBA", (SIZE, SIZE), FOREST)
    icon.alpha_composite(_render_mark())
    icon.save(OUT / "icon.png")

    # adaptive foreground: transparent, mark shrunk into Android's ~66% circular safe zone
    _render_mark(scale=0.72).save(OUT / "adaptive-icon.png")

    # splash mark: transparent, generous margin (splash bg color comes from app.json)
    _render_mark(scale=0.60).save(OUT / "splash-icon.png")

    # small in-app logo (header)
    _render_mark().resize((256, 256), Image.LANCZOS).save(OUT / "logo.png")

    for name in ["icon.png", "adaptive-icon.png", "splash-icon.png", "logo.png"]:
        print(f"wrote {OUT / name}")


if __name__ == "__main__":
    main()
