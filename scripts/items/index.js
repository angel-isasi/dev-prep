// Genera los ítems de lección del celular (estilo Duolingo) a partir del contenido que ya existe.
// Formato: docs/guia-items-movil.md. Lo usa scripts/exportar-movil.js para escribir items.json.
import { seccionMarkdown } from "../../server/markdown.js";
import { generarQuiz } from "./quiz.js";
import { generarReferencia } from "./referencia.js";
import { generarTs } from "./typescript.js";
import { generarHuecos } from "./huecos.js";
import { generarOrdenar } from "./ordenar.js";
import { generarTarjeta } from "./tarjetas.js";
import { crearUnidades, unidadDeEjercicio } from "./unidades.js";

/** Colecciones cuya solución no viaja al celular (regla acordada: los retos son para la laptop). */
export const COLECCIONES_SIN_SOLUCION = ["javascript/retos", "react/retos", "typescript/retos"];

const ORDEN_TIPOS = ["opcion/quiz", "opcion/metodo", "opcion/devuelve", "opcion/ts", "emparejar", "hueco", "ordenar", "tarjeta"];
export const tipoDe = (item) => (item.subtipo ? `${item.tipo}/${item.subtipo}` : item.tipo);

/**
 * @param {object} p
 * @param {{ ejercicios: object[] }} p.indice           de crearIndice (server/contenido.js)
 * @param {object[]} p.temas                           de cargarTemas (server/aprender.js)
 * @param {{ entradas: object[] }} p.referencia        de cargarReferencia (server/aprender.js)
 * @param {(ej: object, archivo: string) => Promise<string|null>|string|null} p.leerArchivo
 *        lee un archivo de la carpeta de un ejercicio (null si no existe)
 * @returns {Promise<{ version: 1, unidades: object[], items: object[], resumen: object }>}
 */
export async function generarItems({ indice, temas, referencia, leerArchivo }) {
  const unidades = crearUnidades(temas);
  const items = [...generarQuiz(temas), ...generarReferencia(referencia.entradas ?? [])];
  const sinUnidad = [];

  const leer = async (ej, archivo) => {
    try {
      return (await leerArchivo(ej, archivo)) ?? null;
    } catch {
      return null;
    }
  };

  for (const ej of indice.ejercicios) {
    const unidad = unidadDeEjercicio(ej, temas);
    if (!unidad) {
      sinUnidad.push(ej.id);
      continue;
    }
    if (COLECCIONES_SIN_SOLUCION.includes(ej.coleccion)) continue; // sin solución en el celular
    const solucion = await leer(ej, ej.archivos.solucion);
    if (!solucion) continue;
    const explicacion = (await leer(ej, "explicacion.md")) ?? "";
    const ideaClave = seccionMarkdown(explicacion, "Idea clave");
    const base = { ej, unidad, solucion, lenguaje: ej.ext, ideaClave };

    if (ej.ext === "ts" || ej.ext === "tsx") {
      const tests = await leer(ej, ej.archivos.tests);
      if (tests) items.push(...generarTs({ ...base, tests }));
    }
    items.push(...generarHuecos(base), ...generarOrdenar(base), generarTarjeta(base));
  }

  // Claves únicas: si alguna se repite (no debería), gana la primera
  const vistas = new Set();
  const unicos = items.filter((it) => !vistas.has(it.clave) && vistas.add(it.clave));

  // Orden: por unidad (orden de estudio), luego por tipo
  const posUnidad = new Map(unidades.map((u, i) => [u.id, i]));
  const conUnidad = unicos.filter((it) => posUnidad.has(it.unidad));
  const posicion = new Map(conUnidad.map((it, i) => [it, i]));
  conUnidad.sort(
    (a, b) =>
      posUnidad.get(a.unidad) - posUnidad.get(b.unidad) ||
      ORDEN_TIPOS.indexOf(tipoDe(a)) - ORDEN_TIPOS.indexOf(tipoDe(b)) ||
      posicion.get(a) - posicion.get(b),
  );

  return { version: 1, unidades, items: conUnidad, resumen: resumir(conUnidad, unidades, sinUnidad) };
}

/** Cuenta los ítems por tipo/subtipo y por unidad. */
export function resumir(items, unidades, sinUnidad = []) {
  const porTipo = Object.fromEntries(ORDEN_TIPOS.map((t) => [t, 0]));
  const porUnidad = Object.fromEntries(unidades.map((u) => [u.id, 0]));
  for (const it of items) {
    porTipo[tipoDe(it)] = (porTipo[tipoDe(it)] ?? 0) + 1;
    porUnidad[it.unidad] = (porUnidad[it.unidad] ?? 0) + 1;
  }
  return { total: items.length, porTipo, porUnidad, sinUnidad };
}
