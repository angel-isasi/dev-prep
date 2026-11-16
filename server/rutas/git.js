// Rutas del motor para Git práctico (necesitan git y el disco de la laptop).
//   GET  /api/git                 los escenarios (sin su solución)
//   POST /api/git/:id/preparar    crea (o reinicia) el repositorio del escenario y lo abre en VS Code
//   POST /api/git/:id/abrir       abre en VS Code el repositorio que ya preparaste
//   POST /api/git/:id/verificar   revisa si lo resolviste
import { Router } from "express";
import { appendFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cargarEscenarios, escenarioPublico, prepararEscenario, rutasDe, verificarEscenario } from "../git-practico.js";

/** La tarea queda dentro del repositorio para leerla en VS Code, pero Git la ignora (.git/info/exclude). */
async function escribirTarea(carpeta, e) {
  const texto = [
    `# ${e.titulo}`,
    "",
    "## La situación",
    "",
    e.situacion,
    "",
    "## Tu tarea",
    "",
    e.tarea,
    "",
    "## Comandos que te pueden servir",
    "",
    ...e.comandos.map((c) => `- \`${c}\``),
    "",
    'Abre la terminal de VS Code (Ctrl + ñ o Ctrl + `) y resuélvelo con git. Cuando termines, vuelve a dev-prep y toca "Verificar".',
    "",
  ].join("\n");
  await writeFile(path.join(carpeta, "TAREA.md"), texto);
  await appendFile(path.join(carpeta, ".git", "info", "exclude"), "\nTAREA.md\n");
}

export function rutasGit({ config, vscode }) {
  const router = Router();
  let cache = null;
  const escenarios = async () => (cache ??= await cargarEscenarios(config.contenidoDir));
  const buscar = async (id) => (await escenarios()).find((e) => e.id === id);

  router.get("/git", async (req, res) => res.json((await escenarios()).map(escenarioPublico)));

  router.post("/git/:id/preparar", async (req, res) => {
    const e = await buscar(req.params.id);
    if (!e) return res.status(404).json({ error: "No existe ese escenario" });
    const carpeta = await prepararEscenario(e);
    await escribirTarea(carpeta, e);
    await vscode(carpeta, path.join(carpeta, "TAREA.md")).catch(() => {});
    res.json({ carpeta });
  });

  router.post("/git/:id/abrir", async (req, res) => {
    const e = await buscar(req.params.id);
    if (!e) return res.status(404).json({ error: "No existe ese escenario" });
    const { repo } = rutasDe(e.id);
    await vscode(repo, path.join(repo, "TAREA.md"));
    res.json({ carpeta: repo });
  });

  router.post("/git/:id/verificar", async (req, res) => {
    const e = await buscar(req.params.id);
    if (!e) return res.status(404).json({ error: "No existe ese escenario" });
    res.json(await verificarEscenario(e));
  });

  return router;
}
