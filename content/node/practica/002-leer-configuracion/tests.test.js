import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { leerConfiguracion, CONFIG_POR_DEFECTO } from "./solucion.js";

// Cada test trabaja en su propia carpeta temporal, que se borra al final.
let dir;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "devprep-config-"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

test("lee el archivo y completa lo que falta con los valores por defecto", async () => {
  const ruta = path.join(dir, "config.json");
  await writeFile(ruta, JSON.stringify({ puerto: 8080 }));
  expect(await leerConfiguracion(ruta)).toEqual({ puerto: 8080, idioma: "es", modoOscuro: false });
});

test("los valores del archivo reemplazan a todos los de por defecto", async () => {
  const ruta = path.join(dir, "config.json");
  await writeFile(ruta, JSON.stringify({ puerto: 5000, idioma: "en", modoOscuro: true }));
  expect(await leerConfiguracion(ruta)).toEqual({ puerto: 5000, idioma: "en", modoOscuro: true });
});

test("si el archivo no existe, devuelve los valores por defecto", async () => {
  const ruta = path.join(dir, "no-existe.json");
  expect(await leerConfiguracion(ruta)).toEqual({ puerto: 3000, idioma: "es", modoOscuro: false });
});

test("devuelve un objeto nuevo: modificarlo no cambia CONFIG_POR_DEFECTO", async () => {
  const config = await leerConfiguracion(path.join(dir, "no-existe.json"));
  config.puerto = 1;
  expect(CONFIG_POR_DEFECTO.puerto).toBe(3000);
});

test("si el JSON está roto, lanza un error que dice \"JSON inválido\"", async () => {
  const ruta = path.join(dir, "config.json");
  await writeFile(ruta, '{ "puerto": 80,');
  await expect(leerConfiguracion(ruta)).rejects.toThrow("JSON inválido");
});

test("otros errores de lectura no se esconden (leer una carpeta falla)", async () => {
  // dir existe pero es una carpeta, no un archivo: el error no es ENOENT.
  await expect(leerConfiguracion(dir)).rejects.toThrow();
});
