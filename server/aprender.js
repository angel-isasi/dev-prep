// Temas de Aprender (content/aprender/NN-tema/) y Referencia offline (content/referencia/*.json).
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

/** Secciones obligatorias de cada teoria.md, en orden. */
export const SECCIONES_TEORIA = ["En una frase", "Lo esencial", "Errores típicos", "Chuleta", "En la entrevista"];
/** Áreas de Aprender, en el orden en que se muestran. */
export const AREAS = ["javascript", "react", "typescript", "node"];
const CAMPOS_REFERENCIA = ["id", "nombre", "firma", "descripcion", "ejemplo", "devuelve", "errorTipico"];

/**
 * @returns {Promise<{ temas: object[], porId: Map<string, object>, errores: string[] }>}
 */
export async function cargarTemas(contenidoDir) {
  const dir = path.join(contenidoDir, "aprender");
  const carpetas = (await readdir(dir, { withFileTypes: true }).catch(() => []))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  const temas = [];
  const errores = [];
  for (const carpeta of carpetas) {
    const ruta = path.join(dir, carpeta);
    try {
      const meta = JSON.parse(await readFile(path.join(ruta, "meta.json"), "utf8"));
      const teoria = await readFile(path.join(ruta, "teoria.md"), "utf8");
      const quiz = JSON.parse(await readFile(path.join(ruta, "quiz.json"), "utf8"));
      temas.push({ ...meta, area: meta.area ?? "javascript", ejercicios: meta.ejercicios ?? [], teoria, quiz, carpeta });
    } catch (error) {
      errores.push(`aprender/${carpeta}: ${error.message}`);
    }
  }
  temas.sort((a, b) => AREAS.indexOf(a.area) - AREAS.indexOf(b.area) || (a.orden ?? 99) - (b.orden ?? 99));
  return { temas, porId: new Map(temas.map((t) => [t.id, t])), errores };
}

/** Revisa un tema contra el estándar. `idsEjercicios`: ids que existen en el banco. */
export function revisarTema(tema, idsEjercicios) {
  const problemas = [];
  if (!tema.id || !tema.titulo || !tema.descripcion) problemas.push("meta.json necesita id, titulo y descripcion");
  if (!AREAS.includes(tema.area)) problemas.push(`area debe ser una de: ${AREAS.join(", ")}`);
  const titulos = [...tema.teoria.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  const faltan = SECCIONES_TEORIA.filter((s) => !titulos.includes(s));
  if (faltan.length) problemas.push(`a teoria.md le faltan secciones: ${faltan.join(", ")}`);
  if (tema.ejercicios.length < 3 || tema.ejercicios.length > 5) problemas.push("debe tener de 3 a 5 ejercicios guiados");
  for (const id of tema.ejercicios) if (!idsEjercicios.has(id)) problemas.push(`el ejercicio ${id} no existe`);
  if (!Array.isArray(tema.quiz) || tema.quiz.length < 5) problemas.push("quiz.json debe tener al menos 5 preguntas");
  (Array.isArray(tema.quiz) ? tema.quiz : []).forEach((q, i) => {
    const ok =
      typeof q.pregunta === "string" &&
      Array.isArray(q.opciones) &&
      q.opciones.length >= 3 &&
      q.opciones.length <= 4 &&
      Number.isInteger(q.correcta) &&
      q.correcta >= 0 &&
      q.correcta < q.opciones.length &&
      typeof q.explicacion === "string" &&
      q.explicacion.trim();
    if (!ok) problemas.push(`quiz: la pregunta ${i + 1} está incompleta (pregunta, 3-4 opciones, correcta, explicacion)`);
  });
  return problemas;
}

/** @returns {Promise<{ categorias: object[], entradas: object[], errores: string[] }>} */
export async function cargarReferencia(contenidoDir) {
  const dir = path.join(contenidoDir, "referencia");
  const archivos = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json")).sort();
  const categorias = [];
  const entradas = [];
  const errores = [];
  const ids = new Set();
  for (const archivo of archivos) {
    try {
      const { categoria, entradas: lista } = JSON.parse(await readFile(path.join(dir, archivo), "utf8"));
      categorias.push({ nombre: categoria, total: lista.length });
      for (const e of lista) {
        const faltan = CAMPOS_REFERENCIA.filter((c) => typeof e[c] !== "string" || !e[c].trim());
        if (faltan.length) errores.push(`referencia/${archivo} ${e.id ?? e.nombre}: faltan ${faltan.join(", ")}`);
        if (ids.has(e.id)) errores.push(`referencia: id repetido ${e.id}`);
        ids.add(e.id);
        entradas.push({ ...e, categoria });
      }
    } catch (error) {
      errores.push(`referencia/${archivo}: ${error.message}`);
    }
  }
  return { categorias, entradas, errores };
}
