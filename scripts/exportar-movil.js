// npm run exportar:movil
// Convierte todo content/ en archivos JSON para la versión celular, que funciona sin servidor
// y sin internet. Se escriben en client/public-movil/datos/ (carpeta generada, no va al repo):
//   ejercicios.json         resumen de todos los ejercicios (para listas y filtros)
//   col/<coleccion>.json    enunciado, pistas y solución de cada ejercicio, un archivo por colección
//   aprender.json           temas de Aprender completos (teoría y quiz)
//   referencia.json         la Referencia offline
//   entrevistas.json        preguntas de entrevista y guías
//   version.json            fecha y totales, para mostrar "Contenido del ..." en Ajustes
// En el celular, los retos de entrevista se exportan SIN solución: se resuelven en la laptop.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../server/config.js";
import { crearIndice } from "../server/contenido.js";
import { cargarReferencia, cargarTemas } from "../server/aprender.js";
import { cargarEntrevistas } from "../server/entrevistas.js";

const SALIDA = path.join(config.raiz, "client", "public-movil", "datos");

/** Colecciones cuya solución no viaja al celular (regla acordada: los retos son para la laptop). */
export const COLECCIONES_SIN_SOLUCION = ["javascript/retos", "react/retos", "typescript/retos"];

/** Nombre de archivo de una colección: "react/retos" -> "react__retos". */
export const archivoColeccion = (coleccion) => coleccion.replaceAll("/", "__");

const leer = (ej, archivo) => readFile(path.join(ej.carpeta, archivo), "utf8");

async function escribir(relativa, datos) {
  const ruta = path.join(SALIDA, relativa);
  await mkdir(path.dirname(ruta), { recursive: true });
  const texto = JSON.stringify(datos);
  await writeFile(ruta, texto);
  return texto.length;
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

async function main() {
  const inicio = Date.now();
  await rm(SALIDA, { recursive: true, force: true });

  const indice = await crearIndice(config.contenidoDir);
  for (const error of indice.errores) console.warn(`  aviso: ${error}`);

  let total = 0;

  // 1. Resumen de ejercicios y detalle por colección
  const resumen = [];
  const porColeccion = new Map();
  for (const ej of indice.ejercicios) {
    const pistas = JSON.parse(await leer(ej, "pistas.json").catch(() => "[]"));
    resumen.push({
      id: ej.id,
      titulo: ej.titulo,
      tipo: ej.tipo,
      tema: ej.tema,
      nivel: ej.nivel,
      tags: ej.tags,
      coleccion: ej.coleccion,
      ext: ej.ext,
      totalPistas: pistas.length,
    });
    const conSolucion = !COLECCIONES_SIN_SOLUCION.includes(ej.coleccion);
    const detalle = {
      enunciado: await leer(ej, "enunciado.md"),
      pistas,
      solucion: conSolucion
        ? {
            codigo: await leer(ej, ej.archivos.solucion),
            lenguaje: ej.ext,
            explicacion: await leer(ej, "explicacion.md").catch(() => ""),
          }
        : null,
    };
    if (!porColeccion.has(ej.coleccion)) porColeccion.set(ej.coleccion, {});
    porColeccion.get(ej.coleccion)[ej.id] = detalle;
  }
  total += await escribir("ejercicios.json", resumen);
  for (const [coleccion, detalles] of porColeccion) {
    total += await escribir(`col/${archivoColeccion(coleccion)}.json`, detalles);
  }

  // 2. Aprender (sin la ruta de disco de cada tema)
  const aprender = await cargarTemas(config.contenidoDir);
  for (const error of aprender.errores ?? []) console.warn(`  aviso: ${error}`);
  const temas = aprender.temas.map(({ carpeta, ...tema }) => tema);
  total += await escribir("aprender.json", temas);

  // 3. Referencia
  const referencia = await cargarReferencia(config.contenidoDir);
  total += await escribir("referencia.json", { categorias: referencia.categorias, entradas: referencia.entradas });

  // 4. Entrevistas
  const entrevistas = await cargarEntrevistas(config.contenidoDir);
  total += await escribir("entrevistas.json", {
    categorias: entrevistas.categorias,
    preguntas: entrevistas.preguntas,
    guias: entrevistas.guias,
  });

  // 5. Versión
  await escribir("version.json", {
    generado: new Date().toISOString(),
    ejercicios: resumen.length,
    temas: temas.length,
    entradas: referencia.entradas.length,
    preguntas: entrevistas.preguntas.length,
  });

  console.log(
    `Exportado para el celular: ${resumen.length} ejercicios en ${porColeccion.size} colecciones, ` +
      `${temas.length} temas, ${referencia.entradas.length} entradas de Referencia y ` +
      `${entrevistas.preguntas.length} preguntas (${kb(total)}) en ${Date.now() - inicio} ms.`,
  );
}

// Solo corre si se ejecuta como script (los tests importan las funciones de arriba).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
