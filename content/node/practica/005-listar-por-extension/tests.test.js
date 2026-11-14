import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { listarPorExtension, contarPorExtension } from "./solucion.js";

// Carpeta de prueba:
//   hola.md, LEEME.MD, zeta.md, foto.png, app.js, Makefile   (archivos)
//   borradores.md/ (con un archivo dentro), imagenes/          (carpetas)
let dir;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "devprep-listar-"));
  for (const nombre of ["hola.md", "LEEME.MD", "zeta.md", "foto.png", "app.js", "Makefile"]) {
    await writeFile(path.join(dir, nombre), "x");
  }
  await mkdir(path.join(dir, "borradores.md"));
  await writeFile(path.join(dir, "borradores.md", "oculto.md"), "x");
  await mkdir(path.join(dir, "imagenes"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

test("lista los .md ordenados alfabéticamente", async () => {
  expect(await listarPorExtension(dir, ".md")).toEqual(["LEEME.MD", "hola.md", "zeta.md"]);
});

test("ignora las carpetas aunque su nombre termine en .md, y no entra en ellas", async () => {
  const lista = await listarPorExtension(dir, ".md");
  expect(lista).not.toContain("borradores.md");
  expect(lista).not.toContain("oculto.md");
});

test("funciona con otras extensiones", async () => {
  expect(await listarPorExtension(dir, ".png")).toEqual(["foto.png"]);
});

test("devuelve [] si no hay coincidencias", async () => {
  expect(await listarPorExtension(dir, ".pdf")).toEqual([]);
});

test("contarPorExtension cuenta por extensión en minúsculas y sin contar carpetas", async () => {
  expect(await contarPorExtension(dir)).toEqual({
    ".md": 3,
    ".png": 1,
    ".js": 1,
    "(sin extensión)": 1,
  });
});

test("una carpeta vacía da [] y {}", async () => {
  const vacia = path.join(dir, "imagenes");
  expect(await listarPorExtension(vacia, ".md")).toEqual([]);
  expect(await contarPorExtension(vacia)).toEqual({});
});
