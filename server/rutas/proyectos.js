// Rutas del motor para "Conseguir trabajo": pruebas técnicas para casa, el proyecto guiado y el portafolio.
//   GET  /api/proyectos                    pruebas y proyecto guiado (con enunciados, rúbrica y etapas)
//   POST /api/proyectos/:id/abrir          prepara la carpeta (hasta la etapa indicada) y la abre en VS Code
//   POST /api/proyectos/:id/verificar      corre sus tests una vez y devuelve el resultado
//   GET  /api/portafolio                   fichas de portafolio, con si ya resolviste y exportaste cada una
//   POST /api/portafolio/:ejercicio/exportar   crea el mini proyecto en Documentos/portafolio y lo abre en VS Code
import { Router } from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cargarProyectos, correrTestsDe, prepararProyecto } from "../proyectos.js";
import { cargarPortafolio, exportarPortafolio, yaExportado } from "../portafolio.js";

export function rutasProyectos({ config, indice, progreso, workspace, vscode }) {
  const router = Router();
  let cache = null;
  const proyectos = async () => (cache ??= await cargarProyectos(config.contenidoDir));
  const buscar = async (id) => (await proyectos()).find((p) => p.id === id);
  const sinCarpeta = ({ carpeta: _c, ...p }) => p;

  router.get("/proyectos", async (req, res) => res.json((await proyectos()).map(sinCarpeta)));

  router.post("/proyectos/:id/abrir", async (req, res) => {
    const p = await buscar(req.params.id);
    if (!p) return res.status(404).json({ error: "No existe ese proyecto." });
    const etapa = Number(req.body?.etapa) || p.etapas.length || Infinity;
    const carpeta = await prepararProyecto(p, workspace.raiz, etapa);
    let avisoVSCode = null;
    try {
      await vscode(carpeta, path.join(carpeta, "README.md"));
    } catch (error) {
      avisoVSCode = error.message;
    }
    res.json({ carpeta, avisoVSCode });
  });

  router.post("/proyectos/:id/verificar", async (req, res) => {
    const p = await buscar(req.params.id);
    if (!p) return res.status(404).json({ error: "No existe ese proyecto." });
    const etapa = Number(req.body?.etapa) || p.etapas.length || Infinity;
    const carpeta = await prepararProyecto(p, workspace.raiz, etapa);
    res.json(await correrTestsDe(config.raiz, carpeta));
  });

  router.get("/portafolio", async (req, res) => {
    const fichas = await cargarPortafolio(config.contenidoDir);
    res.json(
      fichas.map((f) => {
        const ej = indice.porId.get(f.ejercicio);
        return { ...f, tituloEjercicio: ej?.titulo ?? f.ejercicio, resuelto: progreso.deEjercicio(f.ejercicio)?.estado === "resuelto", exportado: yaExportado(f) };
      }),
    );
  });

  router.post("/portafolio/:ejercicio/exportar", async (req, res) => {
    const ficha = (await cargarPortafolio(config.contenidoDir)).find((f) => f.ejercicio === req.params.ejercicio);
    const ej = indice.porId.get(req.params.ejercicio);
    if (!ficha || !ej) return res.status(404).json({ error: "No existe esa ficha de portafolio." });
    const registro = progreso.deEjercicio(ej.id);
    if (registro?.estado !== "resuelto") return res.status(409).json({ error: "Primero resuelve el ejercicio: el portafolio lleva tu solución." });
    const solucion = await readFile(workspace.archivoDe(ej), "utf8").catch(() => null);
    if (!solucion) return res.status(409).json({ error: "No encontré tu solución en workspace/. Ábrelo en VS Code y resuélvelo de nuevo." });
    const tests = await readFile(path.join(ej.carpeta, ej.archivos.tests), "utf8");
    const paquete = JSON.parse(await readFile(path.join(config.raiz, "package.json"), "utf8"));
    const carpeta = await exportarPortafolio({
      ficha,
      solucion,
      tests,
      explicacion: registro.explicacion ?? "",
      nombre: progreso.config().nombre ?? "",
      versiones: { ...paquete.dependencies, ...paquete.devDependencies },
    });
    let avisoVSCode = null;
    try {
      await vscode(carpeta, path.join(carpeta, "README.md"));
    } catch (error) {
      avisoVSCode = error.message;
    }
    res.json({ carpeta, avisoVSCode });
  });

  return router;
}
