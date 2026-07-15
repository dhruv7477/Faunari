"""Fold the targeted pull into the training pool — safely.

De-duplicates the new images (perceptual hash) against ALL existing images (so nothing leaks into the
frozen val/test/hard-case sets, and redundant copies are dropped) and against each other; survivors
are added with split=train. The original splits are untouched, so before/after metrics stay
comparable. Outputs:
  data/processed/master_index_expanded.csv  (full expanded index)
  data/processed/kaggle_index.csv           (bundle input for the re-fine-tune)

    python scripts/rebuild_with_targeted.py
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True
ROOT = Path(__file__).resolve().parents[1]
PROC = ROOT / "data" / "processed"
TARGETED_MANIFEST = ROOT / "data" / "manifests" / "inat_targeted_manifest.csv"
HAMMING = 6
_POP = np.array([bin(i).count("1") for i in range(256)], dtype=np.uint8)


def to_rel(path: str) -> str:
    n = str(path).replace("\\", "/")
    return n.split("data/raw/", 1)[1] if "data/raw/" in n else n.rsplit("/", 1)[-1]


def phash_int(path: str) -> int | None:
    import imagehash  # only needed when hashing images, keeps helpers importable without it

    try:
        with Image.open(path) as im:
            return int(str(imagehash.phash(im.convert("RGB"))), 16)
    except Exception:  # noqa: BLE001 - skip unreadable
        return None


def min_hamming(value: int, seen: np.ndarray) -> int:
    """Min Hamming distance of `value` to every hash in `seen` (vectorised popcount)."""
    if len(seen) == 0:
        return 64
    xor = np.bitwise_xor(seen, np.uint64(value)).view(np.uint8).reshape(-1, 8)
    return int(_POP[xor].sum(axis=1).min())


def main() -> None:
    master = pd.read_csv(PROC / "master_index.csv")
    new = pd.read_csv(TARGETED_MANIFEST)

    print(f"hashing {len(master)} existing images...")
    seen = np.array([h for h in (phash_int(p) for p in master["path"]) if h is not None], dtype=np.uint64)
    print(f"hashing {len(new)} new images + de-duplicating (Hamming <= {HAMMING})...")

    kept_rows, dropped = [], 0
    for row in new.to_dict("records"):
        h = phash_int(row["local_path"])
        if h is None:
            dropped += 1
            continue
        if min_hamming(h, seen) <= HAMMING:   # dup of an existing OR an already-kept new image
            dropped += 1
            continue
        seen = np.append(seen, np.uint64(h))
        kept_rows.append({
            "path": row["local_path"], "source": "inat_targeted", "species": row["scientific_name"],
            "venom_label": row["venom_label"], "license": row.get("license"),
            "width": np.nan, "height": np.nan,
            "dup_cluster_id": f"tgt_{len(kept_rows)}", "is_representative": True, "split": "train",
        })

    added = pd.DataFrame(kept_rows)[master.columns]  # align schema/order
    expanded = pd.concat([master, added], ignore_index=True)
    expanded.to_csv(PROC / "master_index_expanded.csv", index=False)

    kaggle = pd.DataFrame({
        "rel_path": expanded["path"].map(to_rel), "split": expanded["split"],
        "venom_label": expanded["venom_label"], "species": expanded["species"],
    })
    kaggle.to_csv(PROC / "kaggle_index.csv", index=False)

    tr_before = int((master["split"] == "train").sum())
    tr_after = int((expanded["split"] == "train").sum())
    print(f"\nnew kept: {len(added)}  |  dropped (dup/unreadable): {dropped}")
    print(f"train: {tr_before} -> {tr_after}  (+{tr_after - tr_before})")
    print("eval sets unchanged:", {s: int((expanded['split'] == s).sum()) for s in ['val', 'test', 'hardcase']})
    print("train venom balance:", expanded[expanded['split'] == 'train']['venom_label'].value_counts().to_dict())
    print(f"\nwrote master_index_expanded.csv ({len(expanded)}) + kaggle_index.csv")


if __name__ == "__main__":
    main()
