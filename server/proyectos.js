// Pruebas técnicas para casa y el proyecto guiado (content/pruebas y content/proyectos).
// Formato: docs/guia-proyectos.md. Cada uno se copia a workspace/proyectos/<id>/ (dentro de dev-prep,
// así usa sus node_modules: React, Vitest y Testing Library sin instalar nada) y se verifica corriendo
// sus tests una vez.
import { cp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { crearVitest, correrUnaVez } from "./vitest-comun.js";

const leerJson = async (ruta) => JSON.parse(await readFile(ruta, "utf8"));

/** Lista las pruebas técnicas y los proyectos guiados, con su enunciado. */
export async function cargarProyectos(contenidoDir) {
  const lista = [];
  for (const tipo of ["pruebas", "proyectos"]) {
    const dir = path.join(contenidoDir, tipo);
    const carpetas = (await readdir(dir, { withFileTypes: true }).catch(() => [])).filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
    for (const c of carpetas) {
      const carpeta = path.join(dir, c.name);
      const meta = await leerJson(path.join(carpeta, "meta.json")).catch(() => null);
      if (!meta) continue;
      const enunciado = await readFile(path.join(carpeta, "enunciado.md"), "utf8").catch(() => "");
      const rubrica = await leerJson(path.join(carpeta, "rubrica.json")).catch(() => []);
      const etapas = [];
      const dirEtapas = path.join(carpeta, "etapas");
      for (const e of (await readdir(dirEtapas, { withFileTypes: true }).catch(() => [])).filter((x) => x.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
        etapas.push({
          id: e.name,
          enunciado: await readFile(path.join(dirEtapas, e.name, "enunciado.md"), "utf8").catch(() => ""),
          meta: await leerJson(path.join(dirEtapas, e.name, "meta.json")).catch(() => ({ titulo: e.name })),
        });
      }
      lista.push({ ...meta, tipo, carpeta, enunciado, rubrica, etapas });
    }
  }
  return lista;
}

/** Copia una carpeta sin pisar lo que ya existe (para no borrar tu trabajo). */
async function copiarSinPisar(origen, destino) {
  for (const e of await readdir(origen, { withFileTypes: true })) {
    const a = path.join(origen, e.name);
    const b = path.join(destino, e.name);
    if (e.isDirectory()) {
      await mkdir(b, { recursive: true });
      await copiarSinPisar(a, b);
    } else if (!existsSync(b)) await cp(a, b);
  }
}

/**
 * Prepara la carpeta de trabajo: el punto de partida (inicio/) y los tests de las etapas desbloqueadas.
 * Nunca pisa tus archivos; los tests sí se actualizan (son de la app).
 * @returns {Promise<string>} carpeta del proyecto
 */
export async function prepararProyecto(proyecto, workspaceDir, etapaHasta = Infinity) {
  const destino = path.join(workspaceDir, "proyectos", proyecto.id);
  await mkdir(destino, { recursive: true });
  const inicio = path.join(proyecto.carpeta, "inicio");
  if (existsSync(inicio)) await copiarSinPisar(inicio, destino);
  for (const [i, etapa] of proyecto.etapas.entries()) {
    if (i >= etapaHasta) break;
    const tests = path.join(proyecto.carpeta, "etapas", etapa.id, "tests");
    if (existsSync(tests)) await cp(tests, path.join(destino, "tests"), { recursive: true, force: true });
  }
  return destino;
}

/**
 * Corre una vez los tests de una carpeta y devuelve el resultado por archivo y el total.
 * @param {string} raiz       raíz de dev-prep
 * @param {string} carpeta    carpeta del proyecto
 */
export async function correrTestsDe(raiz, carpeta) {
  const relativa = path.relative(raiz, carpeta).replaceAll("\\", "/");
  const resultados = [];
  const vitest = await crearVitest({ raiz, include: [`${relativa}/**/*.test.{js,jsx,ts,tsx}`], watch: false, alTerminar: (r) => resultados.push(...r) });
  try {
    await correrUnaVez(vitest, [carpeta]);
  } finally {
    await vitest.close();
  }
  const pasan = resultados.reduce((s, r) => s + (r.pasan ?? 0), 0);
  // Un archivo que no pudo correr (por ejemplo, importa algo que todavía no creaste) trae 0 tests:
  // cuenta como un test que falla, para que la etapa no aparezca en verde sin haber hecho nada.
  const total = resultados.reduce((s, r) => s + Math.max(r.total ?? 0, r.error ? 1 : 0), 0);
  return { pasan, total, archivos: resultados.map((r) => ({ archivo: path.relative(carpeta, r.archivo).replaceAll("\\", "/"), pasan: r.pasan, total: r.total, error: r.error, casos: r.casos })) };
}

/** Borra una carpeta de proyecto (para empezar de nuevo). */
export const borrarProyecto = (workspaceDir, id) => rm(path.join(workspaceDir, "proyectos", id), { recursive: true, force: true });
