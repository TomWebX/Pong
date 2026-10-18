import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Star-Volley/",
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
