"""Export the fine-tuned BioCLIP image encoder to ONNX and verify it matches torch (fp32).

    python scripts/export_onnx.py

Writes models/bioclip_finetuned.onnx. Verification compares torch encode_image vs ONNX Runtime on
sample images; if max abs diff is tiny, the calibrated head/threshold stay valid unchanged.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from constants import BACKBONE_ID, FINETUNED_WEIGHTS, MODELS_DIR, PROCESSED_DIR  # noqa: E402

ONNX_PATH = MODELS_DIR / "bioclip_finetuned.onnx"


class EncodeImage(nn.Module):
    """Wrap CLIP.encode_image so ONNX export captures just the image tower -> 512-d features."""

    def __init__(self, model: nn.Module) -> None:
        super().__init__()
        self.model = model

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model.encode_image(x)


def main() -> None:
    import open_clip

    model, _, preprocess = open_clip.create_model_and_transforms(BACKBONE_ID)
    model.load_state_dict(torch.load(FINETUNED_WEIGHTS, map_location="cpu"))
    model.eval()
    wrapper = EncodeImage(model).eval()

    dummy = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        wrapper, dummy, str(ONNX_PATH),
        input_names=["pixel_values"], output_names=["embedding"],
        dynamic_axes={"pixel_values": {0: "batch"}, "embedding": {0: "batch"}},
        opset_version=17, do_constant_folding=True,
    )
    print(f"exported -> {ONNX_PATH.name}  ({ONNX_PATH.stat().st_size / 1e6:.0f} MB)")

    # --- verify: torch vs ONNX Runtime on sample images ---
    import onnxruntime as ort
    import pandas as pd

    sess = ort.InferenceSession(str(ONNX_PATH), providers=["CPUExecutionProvider"])
    df = pd.read_csv(PROCESSED_DIR / "master_index.csv").head(8)
    diffs = []
    with torch.no_grad():
        for p in df["path"]:
            t = preprocess(Image.open(p).convert("RGB")).unsqueeze(0)
            torch_emb = wrapper(t).numpy()
            onnx_emb = sess.run(None, {"pixel_values": t.numpy()})[0]
            diffs.append(float(np.abs(torch_emb - onnx_emb).max()))
    print(f"max abs diff (torch vs ONNX) over {len(diffs)} imgs: {max(diffs):.2e}")

    # --- report the exact eval preprocess so the ONNX embedder can replicate it ---
    from torchvision.transforms import CenterCrop, Normalize, Resize
    norm = next(t for t in preprocess.transforms if isinstance(t, Normalize))
    res = next((t for t in preprocess.transforms if isinstance(t, Resize)), None)
    crop = next((t for t in preprocess.transforms if isinstance(t, CenterCrop)), None)
    print("preprocess transforms:", [type(t).__name__ for t in preprocess.transforms])
    print("  resize:", getattr(res, "size", None), "interpolation:", getattr(res, "interpolation", None))
    print("  centercrop:", getattr(crop, "size", None))
    print("  mean:", tuple(float(x) for x in norm.mean), "std:", tuple(float(x) for x in norm.std))


if __name__ == "__main__":
    main()
