import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      playwright: "@cloudflare/playwright",
      "@playwright/test": "@cloudflare/playwright/test",
      "@/lib": path.join(__dirname, "..", "lib"),
      "@/types": path.join(__dirname, "..", "types"),

      fs: "@cloudflare/playwright/fs",

      // https://workers-nodejs-compat-matrix.pages.dev/
      async_hooks: "node:async_hooks",
      assert: "node:assert",
      buffer: "node:buffer",
      child_process: "node:child_process",
      constants: "node:constants",
      crypto: "node:crypto",
      dns: "node:dns",
      events: "node:events",
      http: "node:http",
      http2: "node:http2",
      https: "node:https",
      inspector: "node:inspector",
      module: "node:module",
      net: "node:net",
      os: "node:os",
      path: "node:path",
      process: "node:process",
      readline: "node:readline",
      stream: "node:stream",
      tls: "node:tls",
      url: "node:url",
      util: "node:util",
      zlib: "node:zlib",
    },
  },
  build: {
    assetsInlineLimit: 0,
    // skip code obfuscation
    minify: false,
    lib: {
      name: "@cloudflare/stagehand",
      entry: "../lib/index.ts",
    },
    target: "esnext",
    rollupOptions: {
      output: [
        {
          format: "es",
          dir: "dist/esm",
          preserveModules: true,
          preserveModulesRoot: "../lib",
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
        },
        {
          format: "cjs",
          dir: "dist/cjs",
          preserveModules: true,
          preserveModulesRoot: "../lib",
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
          exports: "named",
        },
      ],
      external: [
        "node:async_hooks",
        "node:assert",
        "node:browser",
        "node:buffer",
        "node:child_process",
        "node:constants",
        "node:crypto",
        "node:dns",
        "node:events",
        "node:http",
        "node:http2",
        "node:https",
        "node:inspector",
        "node:module",
        "node:net",
        "node:os",
        "node:path",
        "node:process",
        "node:readline",
        "node:stream",
        "node:timers",
        "node:tls",
        "node:url",
        "node:util",
        "node:zlib",

        "ai",
        "@cloudflare/playwright",
        "@cloudflare/playwright/fs",
        "zod",
      ],
    },
  },
});
