// npm run exportar:movil
// Convierte todo content/ en archivos JSON para la versión celular, que funciona sin servidor
// y sin internet. Se escriben en client/public-movil/datos/ (carpeta generada, no va al repo):
//   ejercicios.json         resumen de todos los ejercicios (para listas y filtros)
//   col/<coleccion>.json    enunciado, pistas y solución de cada ejercicio, un archivo por colección
//   aprender.json           temas de Aprender completos (teoría y quiz)
//   referencia.json         la Referencia offline
//   entrevistas.json        preguntas de entrevista y guías
//   items.json              ítems de lección generados del contenido (ver docs/guia-items-movil.md)
//   version.json            fecha y totales, para mostrar "Contenido del ..." en Ajustes
// En el celular, los retos de entrevista se exportan SIN solución: se resuelven en la laptop.
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../server/config.js";
import { crearIndice } from "../server/contenido.js";
import { cargarReferencia, cargarTemas } from "../server/aprender.js";
import { cargarEntrevistas } from "../server/entrevistas.js";
import { COLECCIONES_SIN_SOLUCION, generarItems } from "./items/index.js";
import { cargarIngles, ETAPAS as ETAPAS_INGLES } from "../server/ingles.js";
import { generarItemsIngles, historiasParaLeer, unidadesParaLeer } from "./items/ingles.js";
import { cargarGlosario, cargarPredice, cargarRevision } from "../server/aprender-mejor.js";

const SALIDA = path.join(config.raiz, "client", "public-movil", "datos");

// Colecciones cuya solución no viaja al celular: se define junto a los generadores de ítems.
export { COLECCIONES_SIN_SOLUCION };

/** Nombre de archivo de una colección: "react/retos" -> "react__retos". */
export const archivoColeccion = (coleccion) => coleccion.replaceAll("/", "__");

const leer = (ej, archivo) => readFile(path.join(ej.carpeta, archivo), "utf8");

// Huella de todo lo exportado: si el contenido no cambia, version.json tampoco, y el celular
// no muestra "Hay contenido nuevo" por un push que solo tocó la laptop o la documentación.
const huella = createHash("sha256");

async function escribir(relativa, datos) {
  const ruta = path.join(SALIDA, relativa);
  await mkdir(path.dirname(ruta), { recursive: true });
  const texto = JSON.stringify(datos);
  huella.update(relativa).update(texto);
  await writeFile(ruta, texto);
  return texto.length;
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

/** Muestra cuántos ítems salieron por tipo y qué unidades quedaron más flacas. */
function imprimirResumenItems({ resumen, unidades }, bytes) {
  const { total, porTipo, porUnidad, sinUnidad } = resumen;
  console.log(`Ítems de lección: ${total} (${kb(bytes)})`);
  for (const [tipo, n] of Object.entries(porTipo)) console.log(`  ${tipo.padEnd(16)} ${n}`);
  const titulo = new Map(unidades.map((u) => [u.id, u.titulo]));
  const flacas = Object.entries(porUnidad)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([id, n]) => `${titulo.get(id) ?? id} (${n})`);
  console.log(`  Unidades con menos ítems: ${flacas.join(", ")}`);
  if (sinUnidad.length) console.warn(`  aviso: ejercicios sin unidad: ${sinUnidad.join(", ")}`);
}

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
      // En los de depurar, el código con el error es parte del enunciado
      ...(ej.coleccion.endsWith("/depurar") ? { inicio: await leer(ej, ej.archivos.inicio) } : {}),
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
    proceso: entrevistas.proceso,
  });

  // 5. Aprender mejor: glosario y revisión de código (Lee y predice va dentro de los ítems)
  const predice = await cargarPredice(config.contenidoDir);
  const glosario = await cargarGlosario(config.contenidoDir);
  total += await escribir("glosario.json", glosario);
  total += await escribir("revision.json", await cargarRevision(config.contenidoDir));

  // 5b. Ítems de lección (estilo Duolingo), generados del contenido de arriba
  const generados = await generarItems({
    indice,
    temas: aprender.temas,
    referencia,
    predice,
    glosario,
    leerArchivo: (ej, archivo) => leer(ej, archivo).catch(() => null),
  });
  const bytesItems = await escribir("items.json", {
    version: generados.version,
    unidades: generados.unidades,
    items: generados.items,
  });
  total += bytesItems;
  imprimirResumenItems(generados, bytesItems);

  // 6. Inglés: lo que se lee (teoría, palabras, diálogos) y sus ítems de lección, en archivos aparte
  const ingles = await cargarIngles(config.contenidoDir);
  for (const error of ingles.errores) console.warn(`  aviso: ${error}`);
  total += await escribir("ingles.json", { unidades: unidadesParaLeer(ingles.unidades) });
  total += await escribir("historias-ingles.json", historiasParaLeer(ingles.unidades));
  const itemsIngles = generarItemsIngles(ingles.unidades);
  // Un archivo por etapa (básico, intermedio, trabajo): así ninguno pasa el límite del service worker
  let bytesIngles = 0;
  for (const etapa of ETAPAS_INGLES) {
    const unidades = itemsIngles.unidades.filter((u) => u.etapa === etapa);
    const ids = new Set(unidades.map((u) => u.id));
    bytesIngles += await escribir(`items-ingles-${etapa}.json`, { version: 1, unidades, items: itemsIngles.items.filter((it) => ids.has(it.unidad)) });
  }
  total += bytesIngles;
  console.log(`Inglés: ${ingles.unidades.length} unidades y ${itemsIngles.items.length} ítems (${kb(bytesIngles)})`);

  // 7. Versión
  const version = huella.digest("hex").slice(0, 8);
  await mkdir(SALIDA, { recursive: true });
  await writeFile(path.join(SALIDA, "version.json"), JSON.stringify({
    huella: version,
    ejercicios: resumen.length,
    temas: temas.length,
    entradas: referencia.entradas.length,
    preguntas: entrevistas.preguntas.length,
  }));

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
