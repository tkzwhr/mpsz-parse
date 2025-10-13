/// <reference types="vitest" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "mpsz-parse",
      fileName: "index",
      formats: ["es"],
    },
  },
  plugins: [
    dts({
      exclude: ["src/**/*.spec.ts"],
    }),
  ],
  test: {
    globals: false,
    environment: "jsdom",
  },
});
