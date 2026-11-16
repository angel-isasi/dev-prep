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

/**
 * @param {object} deps
 * @param {Awaited<ReturnType<import("./contenido.js").crearIndice>>} deps.indice
 * @param {string} [deps.clienteDir]  carpeta con la interfaz compilada (client/dist)
 */
export function crearApp(deps) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "5mb" })); // el documento de progreso que envía la web puede pesar más de 100 KB
  app.use("/api", controlDeOrigen);

  // La versión web pregunta aquí si dev-prep está abierto en esta laptop.
  app.get("/api/hola", (req, res) => res.json({ app: "dev-prep" }));

  app.use("/api/ejercicios", rutasEjercicios(deps));
  if (deps.progreso) app.use("/api", rutasProgreso(deps));
  if (deps.entrevistas) app.use("/api", rutasEntrevistas(deps));
  if (deps.aprender) app.use("/api", rutasAprender(deps));
  if (deps.eventos) app.get("/api/eventos", deps.eventos.manejador);
  if (deps.sync) app.use("/api", rutasSync(deps));
  if (deps.config && deps.progreso) app.use("/api", rutasProyectos(deps));

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
