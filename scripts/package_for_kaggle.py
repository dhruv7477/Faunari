"""Produce a portable index for fine-tuning on Kaggle/Colab (paths are local-absolute otherwise).

Writes data/processed/kaggle_index.csv with: rel_path (relative to data/raw/), split, venom_label
(conservative override applied), species. Upload data/raw/ + this CSV as a Kaggle dataset; the
fine-tune notebook reconstructs full paths as <kaggle-input-root>/raw/<rel_path>.

    python scripts/package_for_kaggle.py
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
TAXONOMY = ROOT / "data" / "taxonomy"
POSITIVE = "venomous"


def to_rel(path: str) -> str:
    """Path relative to data/raw/, forward-slashed (portable across OS / Kaggle)."""
    norm = path.replace("\\", "/")
    marker = "data/raw/"
    return norm.split(marker, 1)[1] if marker in norm else norm.rsplit("/", 1)[-1]


def main() -> None:
    df = pd.read_csv(PROCESSED / "master_index.csv")
    vmap = pd.read_csv(TAXONOMY / "species_venom_map.csv")
    review = set(vmap.loc[vmap["needs_review"] == True, "scientific_name"])  # noqa: E712
    df.loc[df["species"].isin(review), "venom_label"] = POSITIVE  # conservative override

    out = pd.DataFrame({
        "rel_path": df["path"].map(to_rel),
        "split": df["split"],
        "venom_label": df["venom_label"],
        "species": df["species"],
    })
    dest = PROCESSED / "kaggle_index.csv"
    out.to_csv(dest, index=False)

    print(f"wrote {dest} ({len(out)} rows)")
    print(out["split"].value_counts().to_dict())
    print("\nNext:")
    print("  1) Zip the data:  (from project root)  tar -czf faunari_data.tgz data/raw data/processed/kaggle_index.csv")
    print("  2) Upload faunari_data.tgz as a Kaggle Dataset.")
    print("  3) Run Trials/06_finetune_bioclip_kaggle.ipynb on Kaggle with GPU (T4) enabled.")


if __name__ == "__main__":
    main()
