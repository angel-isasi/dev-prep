// Lee las preguntas de entrevista (content/entrevistas/preguntas/*.json) y las guías.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export async function cargarEntrevistas(contenidoDir) {
  const dir = path.join(contenidoDir, "entrevistas");
  const archivos = (await readdir(path.join(dir, "preguntas")).catch(() => [])).filter((f) => f.endsWith(".json")).sort();
  const categorias = [];
  const preguntas = [];
  for (const archivo of archivos) {
    const { categoria, preguntas: lista } = JSON.parse(await readFile(path.join(dir, "preguntas", archivo), "utf8"));
    const personal = /sobre ti|comportamiento|personal/i.test(categoria);
    categorias.push({ nombre: categoria, total: lista.length, personal });
    for (const p of lista) preguntas.push({ ...p, categoria, personal });
  }
  const leer = (nombre) => readFile(path.join(dir, nombre), "utf8").catch(() => "");
  return {
    categorias,
    preguntas,
    porId: new Map(preguntas.map((p) => [p.id, p])),
    guias: { vozAlta: await leer("guia-voz-alta.md"), star: await leer("guia-star.md"), pitch: await leer("guia-pitch.md") },
  };
}
