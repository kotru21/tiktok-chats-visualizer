import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";

function canonicalOriginFromEnv(mode: string): string {
  const env = loadEnv(mode, process.cwd(), "");
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) {
    const t = prod.trim();
    return t.startsWith("http") ? t.replace(/\/$/, "") : `https://${t.replace(/\/$/, "")}`;
  }
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }
  const manual = env.VITE_CANONICAL_ORIGIN?.trim();
  if (manual) return manual.replace(/\/$/, "");
  return "";
}

export default defineConfig(({ mode }) => {
  const canonicalOrigin = canonicalOriginFromEnv(mode);

  return {
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
    plugins: [
      {
        name: "inject-canonical-when-origin-known",
        transformIndexHtml(html: string) {
          if (!canonicalOrigin) return html;
          const href = `${canonicalOrigin}/`;
          const link = `    <link rel="canonical" href="${href}" />\n    <meta property="og:url" content="${href}" />\n`;
          return html.replace("</head>", `${link}  </head>`);
        },
      },
    ],
    build: {
      outDir: "../dist/client",
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
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
  };
});
