// npm run validar:predice -> revisa content/predice (formato: docs/guia-aprender-mejor.md).
// Ejecuta cada fragmento de JavaScript en un proceso aparte, junta lo que imprime cada console.log
// (separado por un espacio) y comprueba que coincide con la opción marcada como correcta.
import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { config } from "../server/config.js";

const ejecutar = promisify(execFile);
const dir = path.join(config.contenidoDir, "predice");

// Se carga antes del fragmento: cambia console.log para imprimir como en el navegador (strings sin comillas)
// y, al final (también si hay un error sin capturar), escribe todo en una línea.
const PREAMBULO = `
const __salida = [];
const __fmt = (v) => (typeof v === "string" ? v : typeof v === "symbol" ? v.toString() : Number.isNaN(v) ? "NaN" : Object.is(v, -0) ? "0" : String(v));
console.log = (...a) => __salida.push(a.map(__fmt).join(" "));
process.on("uncaughtException", (e) => { __salida.push(e.constructor?.name ?? "Error"); process.exitCode = 0; });
process.on("unhandledRejection", (e) => { __salida.push(e?.constructor?.name ?? "Error"); });
process.on("exit", () => process.stdout.write(__salida.join(" ")));
`;

const normal = (t) => String(t).trim().replace(/\s+/g, " ");

async function salidaDe(codigo) {
  try {
    const { stdout } = await ejecutar(process.execPath, ["--input-type=module", "-e", PREAMBULO + "\n" + codigo], {
      timeout: 5000,
      windowsHide: true,
    });
    return normal(stdout);
  } catch (error) {
    return error.killed ? "(se colgó más de 5 s)" : normal(error.stdout ?? "") || `(error: ${error.message.split("\n")[0]})`;
  }
}

const archivos = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json")).sort();
const problemas = [];
const ids = new Set();
let total = 0;
let verificadas = 0;

for (const archivo of archivos) {
  let preguntas;
  try {
    preguntas = JSON.parse(await readFile(path.join(dir, archivo), "utf8"));
  } catch (error) {
    problemas.push(`${archivo}: JSON inválido (${error.message})`);
    continue;
  }
  for (const p of preguntas) {
    total++;
    const donde = `${archivo} ${p.id}`;
    if (!p.id || ids.has(p.id)) problemas.push(`${donde}: id vacío o repetido`);
    ids.add(p.id);
    if (!p.codigo || !p.explicacion || !p.unidad) problemas.push(`${donde}: faltan codigo, explicacion o unidad`);
    if (!Array.isArray(p.opciones) || p.opciones.length < 3 || p.opciones.length > 4) problemas.push(`${donde}: necesita 3 o 4 opciones`);
    else if (new Set(p.opciones.map(normal)).size !== p.opciones.length) problemas.push(`${donde}: opciones repetidas`);
    if (!Number.isInteger(p.correcta) || p.correcta < 0 || p.correcta >= (p.opciones?.length ?? 0)) problemas.push(`${donde}: "correcta" fuera de rango`);
    if (p.verificar === false) continue;
    verificadas++;
    const obtenida = await salidaDe(p.codigo);
    const esperada = normal(p.opciones?.[p.correcta] ?? "");
    if (obtenida !== esperada) problemas.push(`${donde}: imprime "${obtenida}" pero la opción correcta dice "${esperada}"`);
    const otras = (p.opciones ?? []).filter((_, i) => i !== p.correcta).map(normal);
    if (otras.includes(obtenida)) problemas.push(`${donde}: otra opción también coincide con lo impreso`);
  }
}

console.log(`Lee y predice: ${total} preguntas, ${verificadas} ejecutadas.`);
if (problemas.length) {
  console.log(`\n${problemas.length} problema(s):`);
  for (const p of problemas) console.log(`  - ${p}`);
  process.exit(1);
}
console.log("Todo en orden.");
