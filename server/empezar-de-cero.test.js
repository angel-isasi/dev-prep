import { afterAll, describe, expect, test } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { crearProgreso } from "./progreso.js";

const carpetas = [];
afterAll(() => Promise.all(carpetas.map((c) => rm(c, { recursive: true, force: true }))));

describe("empezar de cero en la laptop", () => {
  test("borra el progreso, conserva tus textos y deja la marca para los otros dispositivos", async () => {
    const datosDir = await mkdtemp(path.join(os.tmpdir(), "devprep-cero-"));
    carpetas.push(datosDir);
    const progreso = await crearProgreso({ datosDir });
    await progreso.verPista("js-1", 1);
    await progreso.cambiarConfig({ metaDiaria: 3 });
    await progreso.guardarExplicacion("js-1", "lo explico así");
    progreso.datos().misRespuestas = { pitch: "mi pitch", historias: [], respuestas: {} };
    expect(Object.keys(progreso.datos().ejercicios)).toContain("js-1");

    await progreso.empezarDeCero();
    const d = progreso.datos();
    expect(d.ejercicios).toEqual({});
    expect(d.dias).toEqual({});
    expect(d.config.metaDiaria).toBe(3);
    expect(d.misRespuestas.pitch).toBe("mi pitch");
    expect(d.ajustes.reinicio.id).toMatch(/^r-/);
    expect(d.epoca).toBe(d.ajustes.reinicio.id);
  });
});
