// Empaqueta la Lambda en un solo archivo (aws/lambda/dist/index.mjs) con los módulos puros de server/
// que usa. El SDK de AWS ya viene en el entorno de Lambda: no se incluye.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const aqui = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  configFile: false,
  logLevel: "warn",
  build: {
    ssr: path.join(aqui, "index.js"),
    outDir: path.join(aqui, "dist"),
    emptyOutDir: true,
    target: "node22",
    minify: false,
    rollupOptions: {
      external: [/^node:/, /^@aws-sdk\//],
      output: { format: "es", entryFileNames: "index.mjs" },
    },
  },
});
