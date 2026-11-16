// Lee las preguntas de entrevista (content/entrevistas/preguntas/*.json) y las guías.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export async function cargarEntrevistas(contenidoDir) {
  const dir = path.join(contenidoDir, "entrevistas");
  const archivos = (await readdir(path.join(dir, "preguntas")).catch(() => [])).filter((f) => f.endsWith(".json")).sort();
  const categorias = [];
  const preguntas = [];
  for (const archivo of archivos) {
    const { categoria, etapa: etapaArchivo, preguntas: lista } = JSON.parse(await readFile(path.join(dir, "preguntas", archivo), "utf8"));
    // Etapa del simulacro por etapas: "rrhh" (personales), "tecnica" o "proyecto" (defiende tu proyecto).
    const etapa = etapaArchivo ?? (/sobre ti|comportamiento|personal/i.test(categoria) ? "rrhh" : "tecnica");
    const personal = etapa !== "tecnica";
    categorias.push({ nombre: categoria, total: lista.length, personal, etapa });
    for (const p of lista) preguntas.push({ ...p, categoria, personal, etapa });
  }
  const proceso = JSON.parse((await readFile(path.join(dir, "proceso.json"), "utf8").catch(() => "null")) || "null");
  const leer = (nombre) => readFile(path.join(dir, nombre), "utf8").catch(() => "");
  return {
    categorias,
    preguntas,
    porId: new Map(preguntas.map((p) => [p.id, p])),
    proceso,
    guias: { vozAlta: await leer("guia-voz-alta.md"), star: await leer("guia-star.md"), pitch: await leer("guia-pitch.md") },
  };
}
