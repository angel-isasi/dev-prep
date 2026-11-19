// Arma la app de Express a partir de sus piezas (índice, progreso, corredor...).
// No lee rutas fijas ni arranca nada por su cuenta: así se puede probar y,
// más adelante, reutilizar dentro de Electron.
import express from "express";
import path from "node:path";
import { existsSync } from "node:fs";
import { rutasEjercicios } from "./rutas/ejercicios.js";
import { rutasProgreso } from "./rutas/progreso.js";
import { rutasEntrevistas } from "./rutas/entrevistas.js";
import { rutasAprender } from "./rutas/aprender.js";
import { rutasSync } from "./rutas/sync.js";
import { rutasProyectos } from "./rutas/proyectos.js";
import { controlDeOrigen } from "./origenes.js";
import { rutasApiPractica } from "./api-practica.js";
import { rutasGit } from "./rutas/git.js";
import { rutasOfertasAuto } from "./rutas/ofertas-auto.js";

/**
 * @param {object} deps
 * @param {Awaited<ReturnType<import("./contenido.js").crearIndice>>} deps.indice
 * @param {string} [deps.clienteDir]  carpeta con la interfaz compilada (client/dist)
 */
export function crearApp(deps) {
  const app = express();
  app.disable("x-powered-by");
  // Cabeceras de seguridad: ninguna página puede meter la app en un marco invisible (clickjacking)
  // ni hacer que el navegador adivine el tipo de un archivo.
  app.use((req, res, next) => {
    res.set({
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });
    next();
  });
  app.use(express.json({ limit: "5mb" })); // el documento de progreso que envía la web puede pesar más de 100 KB
  app.use("/api", controlDeOrigen);

  // La versión web pregunta aquí si dev-prep está abierto en esta laptop.
  app.get("/api/hola", (req, res) => res.json({ app: "dev-prep" }));

  app.use("/api/ejercicios", rutasEjercicios(deps));
  // API falsa que tarda y falla a propósito, para practicar (y para tus proyectos con Vite)
  app.use("/api/practica", rutasApiPractica());
  if (deps.progreso) app.use("/api", rutasProgreso(deps));
  if (deps.entrevistas) app.use("/api", rutasEntrevistas(deps));
  if (deps.aprender) app.use("/api", rutasAprender(deps));
  if (deps.eventos) app.get("/api/eventos", deps.eventos.manejador);
  if (deps.sync) app.use("/api", rutasSync(deps));
  if (deps.config && deps.progreso) app.use("/api", rutasProyectos(deps));
  if (deps.config && deps.vscode) app.use("/api", rutasGit(deps));
  if (deps.config) app.use("/api", rutasOfertasAuto());

  // IA: la laptop no tiene la API key. Le pasa el pedido tal cual a la función de Vercel (con tu
  // contraseña en x-clave) y devuelve su respuesta. Sin internet responde "no configurada".
  const web = deps.webIa ?? process.env.DEVPREP_WEB ?? "https://dev-prep.angel-isasi.com";
  app.all("/api/ia", async (req, res) => {
    if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
    try {
      const headers = { accept: "application/json" };
      if (req.get("x-clave")) headers["x-clave"] = req.get("x-clave");
      if (req.method === "POST") headers["content-type"] = "application/json";
      const r = await fetch(`${web}/api/ia`, {
        method: req.method,
        headers,
        body: req.method === "POST" ? JSON.stringify(req.body ?? {}) : undefined,
        signal: AbortSignal.timeout(60_000),
      });
      res.status(r.status).set("Cache-Control", "no-store").json(await r.json().catch(() => ({})));
    } catch {
      if (req.method === "GET") return res.json({ configurada: false });
      res.status(502).json({ error: "Sin conexión a internet: la IA necesita internet." });
    }
  });

  // Botón "Cerrar dev-prep": responde y luego apaga el servidor.
  if (deps.alApagar) {
    app.post("/api/apagar", (req, res) => {
      res.json({ ok: true });
      setTimeout(deps.alApagar, 200);
    });
  }

  app.use("/api", (req, res) => {
    res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
  });

  // La interfaz compilada. Cualquier otra ruta devuelve index.html y React Router decide.
  if (deps.clienteDir && existsSync(deps.clienteDir)) {
    app.use(express.static(deps.clienteDir));
    app.get("/{*ruta}", (req, res) => res.sendFile(path.join(deps.clienteDir, "index.html")));
  }

  // Errores no esperados: se registran y el navegador recibe un mensaje claro.
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: error.message ?? "Error interno" });
  });

  return app;
}
