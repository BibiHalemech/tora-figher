import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // Relative base works on GitHub project Pages regardless of repo name.
  base: process.env.PAGES_BASE || (command === "build" ? "./" : "/"),
  plugins: [
    {
      name: "strip-pages-redirect",
      transformIndexHtml(html, ctx) {
        if (ctx.server) {
          return html;
        }
        return html.replace(/<script id="pages-redirect">[\s\S]*?<\/script>\s*/u, "");
      },
    },
  ],
  server: {
    host: true,
    port: 5173,
  },
}));
