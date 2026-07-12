import { describe, expect, it } from "vitest";

import head from "../../assets/model/head.json";
import selftest from "../../assets/model/selftest.json";
import { Head, Ood, interpClip, mahalanobisDistance, standardize, venomProbability } from "./head";

describe("head math (synthetic — hand-computable)", () => {
  it("standardize", () => {
    expect(standardize([2, 4], [1, 2], [1, 2])).toEqual([1, 1]);
  });

  it("interpClip interpolates linearly and clips out-of-range", () => {
    const xs = [0, 1, 2];
    const ys = [0, 0.5, 1];
    expect(interpClip(0.5, xs, ys)).toBeCloseTo(0.25);
    expect(interpClip(1.5, xs, ys)).toBeCloseTo(0.75);
    expect(interpClip(-9, xs, ys)).toBe(0); // clip low
    expect(interpClip(9, xs, ys)).toBe(1); // clip high
  });

  it("mahalanobis with identity precision equals euclidean distance", () => {
    const ood: Ood = { mean: [0, 0], precision: [[1, 0], [0, 1]], threshold: 1 };
    expect(mahalanobisDistance([3, 4], ood)).toBeCloseTo(5);
  });
});

describe("head golden (real exported params vs Python)", () => {
  it("venomProbability matches the Python-computed expected value to 5 dp", () => {
    const p = venomProbability(selftest.embedding, head as Head);
    expect(p).toBeCloseTo(selftest.expectedProb, 5);
    expect(p >= (head as Head).threshold).toBe(selftest.expectedIsVenomous);
  });
});
