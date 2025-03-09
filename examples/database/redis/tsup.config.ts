import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  clean: true,
  format: [
    "esm",
  ],
  entry: {
    main: "source/main.ts",
  },
});
