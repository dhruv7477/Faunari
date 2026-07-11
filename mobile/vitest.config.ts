import { defineConfig } from "vitest/config";

// Tests target the pure, RN-free safety logic (verdict, content, screener) — no DOM/native needed.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
