// Prueba cada escenario de Git práctico con git de verdad, en una carpeta temporal:
// recién preparado NO está resuelto, y con su solución oficial sí lo está.
import { afterAll, describe, expect, test } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { config } from "./config.js";
import { aplicarSolucion, cargarEscenarios, escenarioPublico, prepararEscenario, verificarEscenario } from "./git-practico.js";

const escenarios = await cargarEscenarios(config.contenidoDir);
const raiz = await mkdtemp(path.join(os.tmpdir(), "devprep-git-"));
afterAll(() => rm(raiz, { recursive: true, force: true }));

describe("escenarios de Git práctico", () => {
  test("hay 10 escenarios con ids únicos, 3 pistas y explicación", () => {
    expect(escenarios).toHaveLength(10);
    expect(new Set(escenarios.map((e) => e.id)).size).toBe(10);
    for (const e of escenarios) {
      expect(e.pistas, e.id).toHaveLength(3);
      expect(e.explicacion?.length, e.id).toBeGreaterThan(100);
      expect(e.verificar.length, e.id).toBeGreaterThanOrEqual(3);
      expect(e.solucion?.length, e.id).toBeGreaterThan(0);
    }
  });

  test("lo público no incluye la solución ni cómo se prepara", () => {
    const p = escenarioPublico(escenarios[0]);
    expect(p.solucion).toBeUndefined();
    expect(p.preparar).toBeUndefined();
    expect(p.condiciones.length).toBeGreaterThan(0);
  });

  for (const e of escenarios) {
    test(`${e.id} ${e.titulo}: sin resolver no pasa; con la solución, sí`, { timeout: 60_000 }, async () => {
      await prepararEscenario(e, raiz);
      const antes = await verificarEscenario(e, raiz);
      expect(antes.existe).toBe(true);
      expect(antes.listo, `${e.id} ya estaba resuelto al prepararlo`).toBe(false);
      await aplicarSolucion(e, raiz);
      const despues = await verificarEscenario(e, raiz);
      const fallan = despues.condiciones.filter((c) => !c.ok).map((c) => c.texto);
      expect(fallan, `${e.id}: condiciones que no se cumplen con la solución`).toEqual([]);
    });
  }

  test("un escenario que no preparaste no existe", async () => {
    expect((await verificarEscenario({ id: "git-99", verificar: [] }, raiz)).existe).toBe(false);
  });
});
