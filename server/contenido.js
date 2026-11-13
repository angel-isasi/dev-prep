// Lee los ejercicios de content/ y arma un índice en memoria.
// Cada ejercicio es una carpeta con meta.json; la app nunca usa rutas que
// vengan del navegador: busca el ejercicio por su `id` en este índice.
import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";

/** Extensión de los archivos según el tipo de ejercicio. */
export const EXTENSION = { funcion: "js", componente: "jsx" };

export const NIVELES = { 1: "básico", 2: "intermedio", 3: "difícil" };

/** Secciones obligatorias de cada explicacion.md, en orden. */
export const SECCIONES_EXPLICACION = [
  "Idea clave",
  "Paso a paso",
  "Por qué funciona",
  "Errores comunes",
  "Otra forma de resolverlo",
  "Cómo explicarlo en la entrevista",
  "Conceptos",
];

/**
 * @typedef {object} Ejercicio
 * @property {string} id         id estable (no cambia si mueves la carpeta)
 * @property {string} titulo
 * @property {"funcion"|"componente"} tipo
 * @property {string} tema
 * @property {1|2|3} nivel
 * @property {string[]} tags
 * @property {string} coleccion  p. ej. "javascript/ejercicios"
 * @property {string} carpeta    ruta absoluta de la carpeta del ejercicio
 * @property {string} ext        "js" o "jsx"
 * @property {{ inicio: string, solucion: string, tests: string }} archivos
 */

/** Busca recursivamente todas las carpetas que tienen meta.json. */
async function buscarCarpetas(dir) {
  const entradas = await readdir(dir, { withFileTypes: true });
  if (entradas.some((e) => e.isFile() && e.name === "meta.json")) return [dir];
  const subcarpetas = entradas.filter((e) => e.isDirectory()).map((e) => path.join(dir, e.name));
  const resultados = await Promise.all(subcarpetas.map(buscarCarpetas));
  return resultados.flat();
}

/**
 * Escanea content/ y devuelve los ejercicios ordenados por colección y carpeta.
 * Las carpetas con meta.json roto se reportan en `errores` y se saltan.
 * @returns {Promise<{ ejercicios: Ejercicio[], errores: string[] }>}
 */
export async function escanearContenido(contenidoDir) {
  const carpetas = (await buscarCarpetas(contenidoDir)).sort();
  const ejercicios = [];
  const errores = [];

  for (const carpeta of carpetas) {
    const relativa = path.relative(contenidoDir, carpeta).split(path.sep).join("/");
    try {
      const meta = JSON.parse(await readFile(path.join(carpeta, "meta.json"), "utf8"));
      const ext = EXTENSION[meta.tipo];
      if (!meta.id || !meta.titulo || !ext) {
        throw new Error("meta.json necesita id, titulo y tipo (funcion o componente)");
      }
      ejercicios.push({
        id: meta.id,
        titulo: meta.titulo,
        tipo: meta.tipo,
        tema: meta.tema ?? "general",
        nivel: meta.nivel ?? 1,
        tags: meta.tags ?? [],
        coleccion: path.posix.dirname(relativa),
        carpeta,
        ext,
        archivos: {
          inicio: `inicio.${ext}`,
          solucion: `solucion.${ext}`,
          tests: `tests.test.${ext}`,
        },
      });
    } catch (error) {
      errores.push(`${relativa}: ${error.message}`);
    }
  }

  const vistos = new Set();
  for (const ej of ejercicios) {
    if (vistos.has(ej.id)) errores.push(`id repetido: ${ej.id}`);
    vistos.add(ej.id);
  }

  return { ejercicios, errores };
}

const existe = (ruta) => access(ruta).then(() => true, () => false);

/**
 * Revisa que un ejercicio esté completo según el estándar de calidad.
 * @param {Ejercicio} ej
 * @returns {Promise<string[]>} lista de problemas (vacía si está bien)
 */
export async function revisarEjercicio(ej) {
  const problemas = [];
  const requeridos = ["enunciado.md", "explicacion.md", "pistas.json", ...Object.values(ej.archivos)];
  for (const archivo of requeridos) {
    if (!(await existe(path.join(ej.carpeta, archivo)))) problemas.push(`falta ${archivo}`);
  }
  if (![1, 2, 3].includes(ej.nivel)) problemas.push("nivel debe ser 1, 2 o 3");

  if (await existe(path.join(ej.carpeta, "pistas.json"))) {
    try {
      const pistas = JSON.parse(await readFile(path.join(ej.carpeta, "pistas.json"), "utf8"));
      const validas = Array.isArray(pistas) && pistas.length === 3 && pistas.every((p) => typeof p === "string" && p.trim());
      if (!validas) problemas.push("pistas.json debe ser un arreglo de 3 textos");
    } catch {
      problemas.push("pistas.json no es JSON válido");
    }
  }

  if (await existe(path.join(ej.carpeta, "explicacion.md"))) {
    const texto = await readFile(path.join(ej.carpeta, "explicacion.md"), "utf8");
    const titulos = [...texto.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
    const faltan = SECCIONES_EXPLICACION.filter((s) => !titulos.includes(s));
    if (faltan.length) problemas.push(`a explicacion.md le faltan secciones: ${faltan.join(", ")}`);
    else if (titulos.filter((t) => SECCIONES_EXPLICACION.includes(t)).join("|") !== SECCIONES_EXPLICACION.join("|")) {
      problemas.push("las secciones de explicacion.md no están en el orden del estándar");
    }
  }

  return problemas;
}

/** Índice en memoria: lista ordenada y búsqueda por id. */
export async function crearIndice(contenidoDir) {
  const { ejercicios, errores } = await escanearContenido(contenidoDir);
  const porId = new Map(ejercicios.map((ej) => [ej.id, ej]));
  return { ejercicios, porId, errores };
}

/** Saca el texto de una sección "## Título" de un markdown (sin el título). */
export function seccionMarkdown(markdown, titulo) {
  const partes = markdown.split(/^## /m);
  const parte = partes.find((p) => p.startsWith(titulo + "\n") || p.startsWith(titulo + "\r\n"));
  return parte ? parte.slice(parte.indexOf("\n") + 1).trim() : null;
}
