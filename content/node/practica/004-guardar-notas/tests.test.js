import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { guardarNota, leerNota, agregarLinea } from "./solucion.js";

let dir;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "devprep-notas-"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

test("guardarNota crea <titulo>.txt con el texto y devuelve su ruta", async () => {
  const ruta = await guardarNota(dir, "compras", "pan\nhuevos\n");
  expect(ruta).toBe(path.join(dir, "compras.txt"));
  expect(await readFile(ruta, "utf8")).toBe("pan\nhuevos\n");
});

test("guardarNota crea las carpetas que falten (varios niveles)", async () => {
  const carpeta = path.join(dir, "notas", "2026", "noviembre");
  const ruta = await guardarNota(carpeta, "ideas", "app de notas");
  expect(await readFile(ruta, "utf8")).toBe("app de notas");
});

test("guardarNota dos veces con el mismo título reemplaza el contenido", async () => {
  await guardarNota(dir, "pendientes", "versión vieja");
  await guardarNota(dir, "pendientes", "versión nueva");
  expect(await readFile(path.join(dir, "pendientes.txt"), "utf8")).toBe("versión nueva");
});

test("leerNota devuelve el texto como string, con tildes y ñ", async () => {
  await guardarNota(dir, "año", "Mañana: reunión a las 9");
  expect(await leerNota(dir, "año")).toBe("Mañana: reunión a las 9");
});

test("leerNota devuelve null si la nota no existe", async () => {
  expect(await leerNota(dir, "no-existe")).toBeNull();
});

test("agregarLinea agrega al final con un salto de línea", async () => {
  await guardarNota(dir, "compras", "pan\n");
  await agregarLinea(dir, "compras", "leche");
  await agregarLinea(dir, "compras", "café");
  expect(await leerNota(dir, "compras")).toBe("pan\nleche\ncafé\n");
});

test("agregarLinea crea la nota (y la carpeta) si no existían", async () => {
  const carpeta = path.join(dir, "diario");
  await agregarLinea(carpeta, "hoy", "Empecé Node");
  expect(await leerNota(carpeta, "hoy")).toBe("Empecé Node\n");
});
