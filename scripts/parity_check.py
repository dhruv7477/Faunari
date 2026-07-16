"""Print the served Python model's verdict for image(s) — the reference for on-device parity.

Run the same photo through the phone and compare: verdicts MUST match; probabilities should be
close (image decode/resize differs between PIL and Android, so small drift is expected).

    python scripts/parity_check.py path/to/photo.jpg [more.jpg ...]
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from pipeline import FaunariScreener  # noqa: E402


def report(screener: FaunariScreener, path: Path) -> None:
    with Image.open(path) as im:
        image = im.convert("RGB")
    t0 = time.perf_counter()
    result = screener.screen(image)
    ms = (time.perf_counter() - t0) * 1000

    v = result.verdict
    prob = "n/a (OOD)" if v.venom_probability is None else f"{v.venom_probability:.4f}"
    thr = f" (threshold {result.prediction.threshold:.4f})" if result.prediction else ""
    print(f"\n{path.name}")
    print(f"  verdict      : {v.level.value}  |  {v.headline}")
    print(f"  P(venomous)  : {prob}{thr}")
    print(
        f"  ood distance : {result.ood.score:.1f} / {result.ood.threshold:.1f}"
        f"  -> {'OUT of distribution' if result.ood.is_ood else 'in distribution'}"
    )
    print(f"  latency      : {ms:.0f} ms")


def main(args: list[str]) -> int:
    paths = [Path(a) for a in args]
    if not paths:
        print(__doc__)
        return 2
    screener = FaunariScreener.from_artifacts()
    for p in paths:
        if p.exists():
            report(screener, p)
        else:
            print(f"\n{p}: NOT FOUND")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
