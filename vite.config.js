// Vite solo se usa para desarrollar la interfaz (npm run dev) y compilarla (npm run build).
// En el uso diario, Express sirve client/dist ya compilado.
//
// Modo "movil" (npm run build:movil): la versión para el celular. Mismo código, pero:
//   - lib/api.js se cambia por lib/api-movil.js (lee JSON exportados, sin servidor)
//   - lib/eventos.js se cambia por lib/eventos-movil.js (no hay tests en vivo)
//   - los archivos públicos salen de client/public-movil y el build va a client/dist-movil
//   - si algo del cliente importa node:* o express, el build falla (en el celular se rompería)
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.join(RAIZ, "client", "src", "lib");

/** Cambia módulos del cliente por su versión celular, venga de donde venga el import. */
function reemplazosMovil() {
  const reemplazos = new Map([
    [path.join(LIB, "api.js"), path.join(LIB, "api-movil.js")],
    [path.join(LIB, "eventos.js"), path.join(LIB, "eventos-movil.js")],
  ]);
  return {
    name: "devprep-reemplazos-movil",
    enforce: "pre",
    async resolveId(fuente, importador, opciones) {
      if (!importador || !/(^|\/)(api|eventos)\.js$/.test(fuente)) return null;
      const resuelto = await this.resolve(fuente, importador, { ...opciones, skipSelf: true });
      const destino = resuelto && reemplazos.get(path.normalize(resuelto.id));
      return destino ?? null;
    },
  };
}

/** El código del celular corre en el navegador: nada de módulos de Node ni de Express. */
function guardaNavegador() {
  return {
    name: "devprep-guarda-navegador",
    enforce: "pre",
    resolveId(fuente, importador) {
      if (fuente.startsWith("node:") || fuente === "express") {
        throw new Error(`El build móvil no puede importar "${fuente}" (lo importa ${importador}).`);
      }
      return null;
    },
  };
}

export default defineConfig(({ mode }) => {
  const movil = mode === "movil";
  return {
    root: "client",
    publicDir: movil ? "public-movil" : "public",
    plugins: [...(movil ? [guardaNavegador(), reemplazosMovil()] : []), react(), tailwindcss()],
    // La app se carga desde tu disco, no por internet: un archivo de ~1 MB no es problema.
    build: { outDir: movil ? "dist-movil" : "dist", emptyOutDir: true, chunkSizeWarningLimit: 1500 },
    server: {
      port: 5173,
      // El cliente importa funciones puras de server/ (vistas, reglas de progreso).
      fs: { allow: [RAIZ] },
      // En desarrollo, /api va al servidor Express (incluido /api/eventos, SSE).
      proxy: movil ? undefined : { "/api": "http://127.0.0.1:4321" },
    },
  };
});
