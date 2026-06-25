"""Package the exact training data into one Kaggle-ready zip (auto-extracts on upload).

Includes only the images referenced in kaggle_index.csv. Every image is renamed to a safe flat
name (img_NNNNN.ext) because some source filenames contain characters Kaggle forbids in paths
(apostrophes in "Russell's Viper", unicode, etc.). Labels/splits/species live in the CSV columns —
not the filenames — so the flat rename loses nothing. Layout the fine-tune notebook expects:
data/raw/<rel_path> + data/processed/kaggle_index.csv.

    python scripts/build_kaggle_zip.py
"""
from __future__ import annotations

import zipfile
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
CSV = ROOT / "data" / "processed" / "kaggle_index.csv"
OUT = ROOT / "dist" / "faunari_data.zip"


def build() -> None:
    df = pd.read_csv(CSV).reset_index(drop=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    kept: list[dict] = []
    missing = 0
    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_STORED) as zf:  # images already compressed
        for row in df.to_dict("records"):
            src = RAW / row["rel_path"]
            if not src.is_file():
                missing += 1
                continue
            ext = src.suffix.lower() or ".jpg"
            safe = f"img_{len(kept):05d}{ext}"   # flat, Kaggle-safe, collision-proof
            zf.write(src, f"data/raw/{safe}")
            row["rel_path"] = safe
            kept.append(row)
            if len(kept) % 1000 == 0:
                print(f"  ...{len(kept)} images zipped")
        zf.writestr("data/processed/kaggle_index.csv", pd.DataFrame(kept).to_csv(index=False))
    size_mb = OUT.stat().st_size / 1e6
    print(f"DONE: {len(kept)} images (+index) -> {OUT}  ({size_mb:.0f} MB) | missing: {missing}")


if __name__ == "__main__":
    build()
