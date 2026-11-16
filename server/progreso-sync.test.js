import { afterAll, describe, expect, test } from "vitest";
import { mkdtemp, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { crearProgreso } from "./progreso.js";

const carpetas = [];
async function progresoNuevo() {
  const datosDir = await mkdtemp(path.join(os.tmpdir(), "devprep-sync-"));
  carpetas.push(datosDir);
  return { datosDir, progreso: await crearProgreso({ datosDir }) };
}
afterAll(() => Promise.all(carpetas.map((c) => rm(c, { recursive: true, force: true }))));

const remoto = () => ({
  dispositivo: "celular-abc123",
  doc: {
    version: 1,
    preguntas: { p1: { caja: 2, proximo: "2026-11-20", ultima: "sabia", vistas: 1, en: "2026-11-15T10:00:00-05:00" } },
    dias: { "2026-11-15": { preguntas: 1, lecciones: 1 } },
  },
});

describe("mezclar lo que llega de la nube", () => {
  test("no avisa a la sincronización: lo que bajó no hay que volver a subirlo", async () => {
    const { progreso } = await progresoNuevo();
    let avisos = 0;
    progreso.alCambiar(() => avisos++);
    await progreso.fusionar([remoto()]);
    expect(progreso.datos().preguntas.p1.caja).toBe(2);
    expect(avisos).toBe(0);
  });

  test("mezclar dos veces lo mismo no vuelve a escribir el archivo", async () => {
    const { progreso, datosDir } = await progresoNuevo();
    await progreso.fusionar([remoto()]);
    const archivo = path.join(datosDir, "progreso.json");
    const antes = (await stat(archivo)).mtimeMs;
    await new Promise((r) => setTimeout(r, 30));
    await progreso.fusionar([remoto()]);
    expect((await stat(archivo)).mtimeMs).toBe(antes);
  });

  test("un cambio tuyo sí avisa, para subirlo", async () => {
    const { progreso } = await progresoNuevo();
    let avisos = 0;
    progreso.alCambiar(() => avisos++);
    await progreso.calificarPregunta("p9", "sabia");
    expect(avisos).toBe(1);
  });
});
