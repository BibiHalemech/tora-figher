import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // Relative base works on GitHub project Pages regardless of repo name.
  base: process.env.PAGES_BASE || (command === "build" ? "./" : "/"),
  server: {
    host: true,
    port: 5173,
  },
}));
