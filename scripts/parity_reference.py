"""Phase-1b parity check, desktop half: run curated test-split images through the served Python
pipeline and print reference P(venomous) / OOD distance / verdict, copying the images into
parity_test/ so the same files can be sent to the phone and run through the app for comparison.

Verdicts MUST match phone vs desktop; probabilities should be close (PIL vs Android decode/resize
differ slightly). Pushing the copied files to the phone keeps the pixels identical to what we score
here, so any large gap points at the on-device preprocessing, not the model.

    python scripts/parity_reference.py
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

import pandas as pd
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from pipeline import FaunariScreener  # noqa: E402

INDEX = ROOT / "data" / "processed" / "master_index_expanded.csv"
OUT = ROOT / "parity_test"

# species substring -> how many test-split images to sample. A danger spread + the classic
# rat-snake-vs-cobra hard case, matched case-insensitively against common OR scientific names.
PICKS = {
    "Cobra": 2,        # Spectacled/Monocled/King cobra — expect DANGEROUS
    "Russell": 1,      # Russell's viper — expect DANGEROUS
    "Saw-scaled": 1,   # saw-scaled viper — expect DANGEROUS
    "Ptyas": 1,        # rat snake — non-venomous look-alike (hard case)
    "Keelback": 1,     # checkered keelback — non-venomous
}


def _sample(df: pd.DataFrame) -> list[tuple[str, Path]]:
    """(label, path) for each curated test image that exists on disk."""
    test = df[df["split"] == "test"]
    picks: list[tuple[str, Path]] = []
    for needle, n in PICKS.items():
        hits = test[test["species"].str.contains(needle, case=False, na=False)]
        for _, row in hits.head(n).iterrows():
            p = Path(row["path"])
            if p.exists():
                picks.append((f"{needle}-{row['venom_label']}", p))
    return picks


def _report(screener: FaunariScreener, label: str, src: Path, dst: Path) -> None:
    shutil.copyfile(src, dst)
    with Image.open(src) as im:
        result = screener.screen(im.convert("RGB"))
    v = result.verdict
    prob = "n/a (OOD)" if v.venom_probability is None else f"{v.venom_probability:.4f}"
    thr = f" (thr {result.prediction.threshold:.4f})" if result.prediction else ""
    print(f"\n{dst.name}   [{label}]")
    print(f"  verdict     : {v.level.value}  |  {v.headline}")
    print(f"  P(venomous) : {prob}{thr}")
    print(
        f"  ood dist    : {result.ood.score:.1f} / {result.ood.threshold:.1f}"
        f"  -> {'OUT of distribution' if result.ood.is_ood else 'in distribution'}"
    )


def main() -> int:
    if not INDEX.exists():
        print(f"missing {INDEX}")
        return 1
    OUT.mkdir(exist_ok=True)
    picks = _sample(pd.read_csv(INDEX))
    if not picks:
        print("no curated test images found on disk")
        return 1
    screener = FaunariScreener.from_artifacts()
    print(f"Reference verdicts (served Python model) — images copied to {OUT}")
    for i, (label, src) in enumerate(picks):
        _report(screener, label, src, OUT / f"parity_{i:02d}{src.suffix.lower()}")
    print(f"\nPush {OUT}/ to the phone, run each through the app, and compare the two columns.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
