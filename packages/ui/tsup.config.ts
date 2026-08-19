import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  injectStyle: false,
  splitting: false,
  tsconfig: "tsconfig.build.json",
});
