// Pure on-device inference math — mirrors the Python calibrated head + Mahalanobis OOD gate.
// scripts/export_mobile_model.py verifies a numpy reimplementation of exactly this matches sklearn
// (head <1e-4, OOD <1e-3), and ships a golden selftest.json, so this port is provably faithful.

export interface Head {
  scalerMean: number[];
  scalerScale: number[];
  coef: number[];
  intercept: number;
  isoX: number[]; // isotonic thresholds, in logit space
  isoY: number[];
  threshold: number;
}

export interface Ood {
  mean: number[];
  precision: number[][]; // 512x512 shrinkage precision matrix
  threshold: number;
}

export interface Meta {
  backbone: string;
  embeddingDim: number;
  preprocess: { size: number; mean: number[]; std: number[] };
  positiveClass: string;
}

export function standardize(x: number[], mean: number[], scale: number[]): number[] {
  return x.map((v, i) => (v - mean[i]) / scale[i]);
}

export function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/** Clipped piecewise-linear interpolation — matches sklearn IsotonicRegression(out_of_bounds="clip"). */
export function interpClip(x: number, xs: number[], ys: number[]): number {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  if (xs[hi] === xs[lo]) return ys[lo];
  const t = (x - xs[lo]) / (xs[hi] - xs[lo]);
  return ys[lo] + t * (ys[hi] - ys[lo]);
}

/** Calibrated P(venomous): standardize -> logit -> isotonic-calibrate (on the logit). */
export function venomProbability(embedding: number[], head: Head): number {
  const z = standardize(embedding, head.scalerMean, head.scalerScale);
  const logit = dot(z, head.coef) + head.intercept;
  return interpClip(logit, head.isoX, head.isoY);
}

/** Mahalanobis distance from the in-distribution snake cluster: sqrt(d^T · P · d). */
export function mahalanobisDistance(embedding: number[], ood: Ood): number {
  const d = embedding.map((v, i) => v - ood.mean[i]);
  let s = 0;
  for (let i = 0; i < d.length; i++) s += d[i] * dot(ood.precision[i], d);
  return Math.sqrt(Math.max(s, 0));
}
