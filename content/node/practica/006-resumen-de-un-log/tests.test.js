import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { resumirLog } from "./solucion.js";

let dir;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "devprep-log-"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

/** Escribe un log de prueba y devuelve su ruta. */
async function crearLog(lineas, salto = "\n") {
  const ruta = path.join(dir, "app.log");
  await writeFile(ruta, lineas.join(salto));
  return ruta;
}

const LOG = [
  "2026-11-14 10:00:01 INFO Servidor iniciado en el puerto 3000",
  "2026-11-14 10:01:10 INFO Usuario ana inició sesión",
  "2026-11-14 10:02:15 WARN La consulta tardó 2300 ms",
  "2026-11-14 10:05:40 ERROR No se pudo conectar a la base de datos",
  "2026-11-14 10:06:02 ERROR Pedido 42 sin stock",
  "",
];

test("cuenta las líneas por nivel", async () => {
  const resumen = await resumirLog(await crearLog(LOG));
  expect(resumen.total).toBe(5);
  expect(resumen.porNivel).toEqual({ INFO: 2, WARN: 1, ERROR: 2 });
});

test("guarda los mensajes de ERROR completos y en orden", async () => {
  const resumen = await resumirLog(await crearLog(LOG));
  expect(resumen.errores).toEqual(["No se pudo conectar a la base de datos", "Pedido 42 sin stock"]);
});

test("ignora las líneas vacías o con solo espacios", async () => {
  const ruta = await crearLog(["", "2026-11-14 09:00:00 WARN Memoria al 80%", "   ", "", ""]);
  expect(await resumirLog(ruta)).toEqual({
    total: 1,
    porNivel: { INFO: 0, WARN: 1, ERROR: 0 },
    errores: [],
  });
});

test("funciona con saltos de línea de Windows (\\r\\n)", async () => {
  const resumen = await resumirLog(await crearLog(LOG, "\r\n"));
  expect(resumen.total).toBe(5);
  expect(resumen.porNivel).toEqual({ INFO: 2, WARN: 1, ERROR: 2 });
  expect(resumen.errores[1]).toBe("Pedido 42 sin stock");
});

test("un archivo vacío da todo en cero", async () => {
  expect(await resumirLog(await crearLog([]))).toEqual({
    total: 0,
    porNivel: { INFO: 0, WARN: 0, ERROR: 0 },
    errores: [],
  });
});

test("un nivel desconocido (DEBUG) cuenta en total pero no en porNivel", async () => {
  const ruta = await crearLog([
    "2026-11-14 10:00:00 DEBUG Cache vacía",
    "2026-11-14 10:00:01 INFO Listo",
  ]);
  const resumen = await resumirLog(ruta);
  expect(resumen.total).toBe(2);
  expect(resumen.porNivel).toEqual({ INFO: 1, WARN: 0, ERROR: 0 });
});

test("si el archivo no existe, la promesa se rechaza", async () => {
  await expect(resumirLog(path.join(dir, "no-existe.log"))).rejects.toThrow();
});
