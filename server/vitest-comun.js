// Crea una instancia de Vitest con nuestra configuración y un reporter propio.
// La usan el corredor (modo watch, mientras usas la app) y el validador de contenido.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createVitest } from "vitest/node";

const SETUP = path.join(path.dirname(fileURLToPath(import.meta.url)), "vitest-setup.js");

/**
 * @typedef {object} Caso
 * @property {string} nombre
 * @property {boolean} ok
 * @property {string|null} mensaje   mensaje de error si falló
 * @property {string|null} esperado
 * @property {string|null} recibido
 *
 * @typedef {object} ResultadoArchivo
 * @property {string} archivo        ruta absoluta del archivo de tests
 * @property {Caso[]} casos
 * @property {number} pasan
 * @property {number} total
 * @property {string|null} error     error que impidió correr el archivo (p. ej. sintaxis)
 */

const MAX_MENSAJE = 1500;
// Códigos de color de la terminal (p. ej. "ESC[31m"): en el navegador se verían como basura.
const COLORES_TERMINAL = /\u001b\[[0-9;]*m/g;

const recortar = (texto) => {
  if (!texto) return texto ?? null;
  texto = texto.replace(COLORES_TERMINAL, "");
  return texto.length > MAX_MENSAJE ? texto.slice(0, MAX_MENSAJE) + "\n…" : texto;
};

/** Convierte un módulo de tests de Vitest a un objeto simple para la app. */
export function normalizarModulo(modulo) {
  const casos = [...modulo.children.allTests()].map((caso) => {
    const resultado = caso.result();
    const error = resultado.errors?.[0];
    return {
      nombre: caso.name,
      ok: resultado.state === "passed",
      mensaje: recortar(error?.message),
      esperado: error?.expected ?? null,
      recibido: error?.actual ?? null,
    };
  });
  const errorArchivo = modulo.errors()[0];
  return {
    archivo: path.normalize(modulo.moduleId),
    casos,
    pasan: casos.filter((c) => c.ok).length,
    total: casos.length,
    error: recortar(errorArchivo?.message),
  };
}

/**
 * @param {object} opciones
 * @param {string} opciones.raiz        carpeta raíz del proyecto
 * @param {string[]} opciones.include   patrones de archivos de tests
 * @param {boolean} opciones.watch      true: vigila y vuelve a correr al guardar
 * @param {(archivos: string[]) => void} [opciones.alEmpezar]
 * @param {(resultados: ResultadoArchivo[]) => void} opciones.alTerminar
 * @param {(log: { archivo: string|null, tipo: string, texto: string }) => void} [opciones.alLog]
 */
export async function crearVitest({ raiz, include, watch, alEmpezar, alTerminar, alLog }) {
  let ctx; // la instancia de Vitest, para saber de qué archivo viene cada console.log
  const reporter = {
    onInit(v) {
      ctx = v;
    },
    onTestRunStart(especificaciones) {
      alEmpezar?.(especificaciones.map((e) => path.normalize(e.moduleId)));
    },
    onTestRunEnd(modulos) {
      alTerminar(modulos.map(normalizarModulo));
    },
    onUserConsoleLog(log) {
      const entidad = log.taskId ? ctx?.state.getReportedEntityById(log.taskId) : undefined;
      const modulo = entidad ? (entidad.module ?? entidad) : undefined;
      alLog?.({
        archivo: modulo?.moduleId ? path.normalize(modulo.moduleId) : null,
        tipo: log.type,
        texto: log.content,
      });
    },
  };

  const vitest = await createVitest(
    "test",
    {
      watch,
      standalone: watch,
      root: raiz,
      config: false,
      include,
      pool: "forks",
      reporters: [reporter],
      setupFiles: [SETUP],
      testTimeout: 5000,
    },
    { oxc: { jsx: { runtime: "automatic" } } },
  );
  return vitest;
}

/** Corre una vez los tests que coinciden con los filtros (rutas o carpetas). */
export async function correrUnaVez(vitest, filtros) {
  const especificaciones = await vitest.globTestSpecifications(filtros);
  if (especificaciones.length === 0) return;
  await vitest.runTestSpecifications(especificaciones);
}
