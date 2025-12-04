import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  // Корневая директория для Vite - public
  root: "public",

  // Базовый путь для продакшена
  base: "/",

  // Настройки dev-сервера
  server: {
    port: 3001,
    strictPort: false,
    // Проксирование API запросов на Express сервер
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/upload": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },

  // Настройки сборки
  build: {
    // Директория вывода относительно корня проекта
    outDir: "../dist/client",
    emptyOutDir: true,

    // Генерация source maps для отладки
    sourcemap: true,

    // Rollup настройки
    rollupOptions: {
      input: {
        main: resolve(__dirname, "public/index.html"),
      },
      output: {
        // Структура выходных файлов
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

    // Минимальная поддержка браузеров
    target: "es2021",
  },

  // Резолв алиасов путей
  resolve: {
    alias: {
      "@": resolve(__dirname, "public/js"),
      "@types": resolve(__dirname, "types"),
    },
  },

  // Оптимизация зависимостей
  optimizeDeps: {
    include: ["chart.js"],
  },
});
