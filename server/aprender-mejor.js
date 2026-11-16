// Contenido de "Aprender mejor": Lee y predice, glosario y revisión de código (docs/guia-aprender-mejor.md).
// Lo usan el exportador de la versión web y los generadores de ítems.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

async function leerCarpeta(dir) {
  const archivos = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json")).sort();
  const resultado = [];
  for (const archivo of archivos) resultado.push({ archivo, datos: JSON.parse(await readFile(path.join(dir, archivo), "utf8")) });
  return resultado;
}

/** Preguntas "¿qué imprime?" de content/predice. */
export async function cargarPredice(contenidoDir) {
  return (await leerCarpeta(path.join(contenidoDir, "predice"))).flatMap(({ datos }) => datos);
}

/** Glosario: [{ categoria, terminos: [...] }] de content/glosario. */
export async function cargarGlosario(contenidoDir) {
  return (await leerCarpeta(path.join(contenidoDir, "glosario"))).map(({ datos }) => datos);
}

/** Casos de revisión de código de content/revision, ordenados por id. */
export async function cargarRevision(contenidoDir) {
  return (await leerCarpeta(path.join(contenidoDir, "revision"))).map(({ datos }) => datos).sort((a, b) => a.id.localeCompare(b.id));
}

// Lo puro (puntaje y tipos de hallazgo) vive aparte para que la web lo use sin módulos de Node.
export { puntuarRevision, TIPOS_HALLAZGO } from "./revision.js";
