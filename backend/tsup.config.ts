import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  target: "node20",
  format: ["cjs"],
  clean: true,
  sourcemap: true,
  dts: true,
  tsconfig: "tsconfig.json",
});
