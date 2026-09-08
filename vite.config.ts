import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // Project Pages URL is https://<user>.github.io/tora-fighter/
  base: command === "build" ? "/tora-fighter/" : "/",
  server: {
    host: true,
    port: 5173,
  },
}));
