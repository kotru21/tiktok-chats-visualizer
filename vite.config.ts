import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "public",
  base: "/",
  server: {
    port: 3000,
    strictPort: false,
    open: true,
  },
  worker: {
    format: "es",
  },
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "public/index.html"),
      },
      output: {
        entryFileNames: "js/[name]-[hash].js",
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names[0] ?? "";
          if (name.endsWith(".css")) {
            return "css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    target: "es2021",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "public/js"),
      "@types": resolve(__dirname, "types"),
    },
  },
  optimizeDeps: {
    include: ["chart.js"],
  },
});
