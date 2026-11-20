// Vite solo se usa para desarrollar la interfaz (npm run dev) y compilarla (npm run build).
// En el uso diario, Express sirve client/dist ya compilado.
//
// Modo "movil" (npm run build:movil): la versión para el celular. Mismo código, pero:
//   - lib/api.js se cambia por lib/api-movil.js (lee JSON exportados, sin servidor)
//   - lib/eventos.js se cambia por lib/eventos-movil.js (no hay tests en vivo)
//   - App.jsx se cambia por movil/AppMovil.jsx (pantallas del celular)
//   - los archivos públicos salen de client/public-movil y el build va a client/dist-movil
//   - si algo del cliente importa node:* o express, el build falla (en el celular se rompería)
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(RAIZ, "client", "src");
const LIB = path.join(SRC, "lib");

/** Cambia módulos del cliente por su versión celular, venga de donde venga el import. */
function reemplazosMovil() {
  const reemplazos = new Map([
    [path.join(LIB, "api.js"), path.join(LIB, "api-movil.js")],
    [path.join(LIB, "eventos.js"), path.join(LIB, "eventos-movil.js")],
    // Rutas y pantallas propias del celular (no carga las que solo sirven en la laptop)
    [path.join(SRC, "App.jsx"), path.join(SRC, "movil", "AppMovil.jsx")],
  ]);
  return {
    name: "devprep-reemplazos-movil",
    enforce: "pre",
    async resolveId(fuente, importador, opciones) {
      if (!importador || !/(^|\/)((api|eventos)\.js|App\.jsx)$/.test(fuente)) return null;
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

/** Lo que solo lleva el index.html del celular: ícono de Apple y "no indexar". */
function htmlMovil() {
  return {
    name: "devprep-html-movil",
    transformIndexHtml: () => [
      // Va primero: si la app no llega a cargar, repara la copia guardada (ver public-movil/salvavidas.js)
      { tag: "script", attrs: { src: "/salvavidas.js" }, injectTo: "head-prepend" },
      { tag: "link", attrs: { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png" }, injectTo: "head" },
      { tag: "meta", attrs: { name: "robots", content: "noindex, nofollow" }, injectTo: "head" },
    ],
  };
}

/**
 * App instalable que funciona sin internet (PWA). El service worker guarda la app y TODO el
 * contenido la primera vez que la abres; después abre aunque no haya señal.
 * "prompt": nunca se recarga sola (te podría cortar un quiz); avisa "Hay contenido nuevo".
 */
const pwa = () =>
  VitePWA({
    registerType: "prompt",
    injectRegister: false,
    includeAssets: ["favicon.ico", "favicon.svg", "apple-touch-icon-180x180.png"],
    manifest: {
      name: "dev-prep",
      short_name: "dev-prep",
      description: "Aprende JavaScript, React, TypeScript, Node y SQL sin internet.",
      lang: "es",
      start_url: "/",
      scope: "/",
      display: "standalone",
      orientation: "portrait",
      background_color: "#07070a",
      theme_color: "#07070a",
      icons: [
        { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
        { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
      // Atajos al mantener presionado el ícono de la app (Android)
      shortcuts: [
        { name: "Empezar lección", short_name: "Lección", url: "/leccion", icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }] },
        { name: "Lección rápida", short_name: "Rápida", url: "/leccion?modo=rapida", icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }] },
        { name: "Inglés rápido", short_name: "Inglés", url: "/leccion?ambito=ingles&modo=rapida", icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }] },
        { name: "Repasar mis errores", short_name: "Errores", url: "/leccion?modo=errores", icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }] },
      ],
    },
    workbox: {
      // Nombre de la copia guardada: al cambiarlo, cada navegador descarta la anterior y baja todo de nuevo
      // (sirve si una copia quedó dañada tras varias publicaciones seguidas)
      cacheId: "devprep-2",
      // Avisos (Web Push): el service worker carga public-movil/push-sw.js
      importScripts: ["/push-sw.js"],
      // Todo lo necesario para usarla sin internet: la app, los datos y las fuentes en alfabeto latino.
      globPatterns: ["**/*.{js,css,html,svg,png,ico,json}", "**/*-latin-wght-normal-*.woff2"],
      globIgnores: ["**/marco.html"],
      navigateFallback: "/index.html",
      navigateFallbackDenylist: [/^\/datos\//, /^\/\.well-known\//],
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      cleanupOutdatedCaches: true,
    },
  });

export default defineConfig(({ mode }) => {
  const movil = mode === "movil";
  return {
    root: "client",
    publicDir: movil ? "public-movil" : "public",
    plugins: [...(movil ? [guardaNavegador(), reemplazosMovil(), htmlMovil(), pwa()] : []), react(), tailwindcss()],
    // Cada pantalla va en su propio trozo (ver client/src/lib/perezoso.js), así la primera carga es liviana.
    build: { outDir: movil ? "dist-movil" : "dist", emptyOutDir: true },
    server: {
      port: 5173,
      // El cliente importa funciones puras de server/ (vistas, reglas de progreso).
      fs: { allow: [RAIZ] },
      // En desarrollo, /api va al servidor Express (incluido /api/eventos, SSE).
      proxy: movil ? undefined : { "/api": "http://127.0.0.1:4321" },
    },
  };
});
