import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // GitHub repo is `tora-figher`, so Pages lives at /tora-figher/
  // CI can override with PAGES_BASE=/<repo>/
  base:
    process.env.PAGES_BASE ||
    (command === "build" ? "/tora-figher/" : "/"),
  server: {
    host: true,
    port: 5173,
  },
}));
