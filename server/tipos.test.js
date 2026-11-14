import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";
import { revisarTipos } from "./tipos.js";

let raiz;
let carpeta;

beforeAll(async () => {
  // Igual que workspace/: un tsconfig.json en la carpeta de arriba y el ejercicio dentro.
  raiz = await mkdtemp(path.join(os.tmpdir(), "dev-prep-tipos-"));
  carpeta = path.join(raiz, "ts-prueba");
  await mkdir(carpeta);
  await writeFile(path.join(raiz, "tsconfig.json"), JSON.stringify({ compilerOptions: { strict: true } }));
  await writeFile(path.join(carpeta, "inicio.ts"), "export function suma(a, b) {}\n");
});

afterAll(() => rm(raiz, { recursive: true, force: true }));

test("sin errores de tipos devuelve una lista vacía (aunque haya un tsconfig.json)", async () => {
  await writeFile(path.join(carpeta, "solucion.ts"), "export const suma = (a: number, b: number): number => a + b;\n");
  await writeFile(path.join(carpeta, "tests.test.ts"), 'import { suma } from "./solucion";\nconst r: number = suma(1, 2);\nexport { r };\n');
  expect(await revisarTipos(carpeta)).toEqual([]);
});

test("un error de tipos aparece con archivo, línea y mensaje en español", async () => {
  await writeFile(path.join(carpeta, "tests.test.ts"), 'import { suma } from "./solucion";\nconst r: string = suma(1, 2);\nexport { r };\n');
  const errores = await revisarTipos(carpeta);
  expect(errores).toHaveLength(1);
  expect(errores[0]).toMatch(/^tests\.test\.ts, línea 2: El tipo 'number' no se puede asignar al tipo 'string'/);
});

test("no revisa inicio.ts (no compila a propósito)", async () => {
  await writeFile(path.join(carpeta, "tests.test.ts"), 'import { suma } from "./solucion";\nexport const r = suma(1, 2);\n');
  expect(await revisarTipos(carpeta)).toEqual([]);
});
