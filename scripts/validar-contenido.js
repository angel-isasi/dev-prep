// npm run validar                 -> todos los ejercicios
// npm run validar -- js-ej-0      -> solo los que tengan ese texto en su id o en su carpeta
// Revisa que cada ejercicio de content/ esté completo y que funcione:
//   1. Tiene todos sus archivos, 3 pistas y las 7 secciones de la explicación.
//   2. La solución oficial pasa TODOS sus tests (y hay al menos 3).
//   3. El archivo de inicio NO pasa todos los tests (si no, el ejercicio no enseña nada).
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { config } from "../server/config.js";
import { escanearContenido, revisarEjercicio } from "../server/contenido.js";
import { crearVitest, correrUnaVez } from "../server/vitest-comun.js";

// Una carpeta temporal por proceso: así se pueden correr varias validaciones a la vez.
const TMP_NOMBRE = `.validar-tmp-${process.pid}`;
const TMP = path.join(config.raiz, TMP_NOMBRE);
const FILTRO = process.argv[2] ?? "";
const MIN_CASOS = 3;

// En Windows "D:\x" y "d:\x" son la misma ruta.
const clave = (ruta) => path.normalize(ruta).toLowerCase();

/** Corre los tests de las carpetas indicadas y devuelve los resultados por archivo. */
async function correr(carpetas, include) {
  const resultados = new Map();
  const vitest = await crearVitest({
    raiz: config.raiz,
    include,
    watch: false,
    alTerminar: (lista) => lista.forEach((r) => resultados.set(clave(r.archivo), r)),
  });
  try {
    await correrUnaVez(vitest, carpetas);
  } finally {
    await vitest.close();
  }
  return resultados;
}

const escaneo = await escanearContenido(config.contenidoDir);
const ejercicios = escaneo.ejercicios.filter((ej) => !FILTRO || ej.id.includes(FILTRO) || ej.carpeta.includes(FILTRO));
const errores = FILTRO ? [] : escaneo.errores;
if (ejercicios.length === 0) {
  console.log(`No hay ejercicios que coincidan con "${FILTRO}".`);
  process.exit(1);
}
/** @type {Map<string, string[]>} id -> problemas */
const problemas = new Map(ejercicios.map((ej) => [ej.id, []]));

// 1. Estructura
for (const ej of ejercicios) problemas.get(ej.id).push(...(await revisarEjercicio(ej)));

// 2. Las soluciones oficiales pasan
const oficiales = await correr(
  ejercicios.map((ej) => ej.carpeta),
  ["content/**/tests.test.{js,jsx,ts,tsx}"],
);
for (const ej of ejercicios) {
  const r = oficiales.get(clave(path.join(ej.carpeta, ej.archivos.tests)));
  const lista = problemas.get(ej.id);
  if (!r) lista.push("no se encontraron sus tests");
  else if (r.error) lista.push(`la solución no corre: ${r.error}`);
  else if (r.pasan !== r.total) {
    const fallan = r.casos.filter((c) => !c.ok).map((c) => c.nombre);
    lista.push(`la solución oficial falla ${r.total - r.pasan} test(s): ${fallan.join("; ")}`);
  } else if (r.total < MIN_CASOS) lista.push(`tiene ${r.total} test(s), mínimo ${MIN_CASOS}`);
}

// 3. Los archivos de inicio fallan (se copian como solucion.* a una carpeta temporal)
await rm(TMP, { recursive: true, force: true });
for (const ej of ejercicios) {
  const destino = path.join(TMP, ej.id);
  await mkdir(destino, { recursive: true });
  await cp(path.join(ej.carpeta, ej.archivos.inicio), path.join(destino, ej.archivos.solucion));
  await cp(path.join(ej.carpeta, ej.archivos.tests), path.join(destino, ej.archivos.tests));
}
try {
  const inicios = await correr([TMP], [`${TMP_NOMBRE}/**/tests.test.{js,jsx,ts,tsx}`]);
  for (const ej of ejercicios) {
    const r = inicios.get(clave(path.join(TMP, ej.id, ej.archivos.tests)));
    const lista = problemas.get(ej.id);
    if (!r) lista.push("no se pudo probar el archivo de inicio");
    else if (r.error) lista.push(`el archivo de inicio tiene un error: ${r.error}`);
    else if (r.total > 0 && r.pasan === r.total) lista.push("el archivo de inicio ya pasa todos los tests");
  }
} finally {
  await rm(TMP, { recursive: true, force: true });
}

// Resumen
let malos = 0;
for (const ej of ejercicios) {
  const lista = problemas.get(ej.id);
  if (lista.length === 0) {
    console.log(`  ✅ ${ej.id}  ${ej.titulo}`);
  } else {
    malos++;
    console.log(`  ❌ ${ej.id}  ${ej.titulo}`);
    for (const p of lista) console.log(`       - ${p}`);
  }
}
for (const e of errores) console.log(`  ❌ ${e}`);

const total = ejercicios.length;
console.log(`\n${total - malos}/${total} ejercicios válidos${errores.length ? `, ${errores.length} carpeta(s) con error` : ""}.`);
process.exitCode = malos || errores.length ? 1 : 0;
