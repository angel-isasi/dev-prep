import { describe, expect, it } from "vitest";
import { calificar, colaDeHoy, intervalo, recordar, vistaPrevia } from "./tarjetas-reglas.js";

describe("FSRS de las tarjetas", () => {
  it("con estabilidad s la retención a los s días es 90%", () => {
    expect(recordar(10, 10)).toBeCloseTo(0.9, 2);
    expect(intervalo(10)).toBe(10);
  });

  it("una tarjeta nueva: otra vez vuelve mañana, fácil tarda más que bien", () => {
    const hoy = "2026-11-20";
    expect(calificar(null, 1, hoy).proxima).toBe("2026-11-21");
    expect(calificar(null, 1, hoy).hoyOtraVez).toBe(true);
    const bien = calificar(null, 3, hoy);
    const facil = calificar(null, 4, hoy);
    expect(facil.proxima > bien.proxima).toBe(true);
    expect(facil.d).toBeLessThan(bien.d);
  });

  it("acertar a tiempo alarga el intervalo y fallar lo acorta", () => {
    const primera = calificar(null, 3, "2026-11-01");
    const segunda = calificar(primera, 3, primera.proxima);
    expect(segunda.s).toBeGreaterThan(primera.s);
    const fallo = calificar(segunda, 1, segunda.proxima);
    expect(fallo.s).toBeLessThan(segunda.s);
    expect(fallo.fallos).toBe(1);
    expect(fallo.repasos).toBe(3);
  });

  it("vista previa de los 4 botones", () => {
    const v = vistaPrevia(null, "2026-11-20");
    expect(v.otra).toBe("hoy otra vez");
    expect(v.bien).toMatch(/d$/);
  });

  it("la cola respeta los topes y el mazo", () => {
    const hoy = "2026-11-20";
    const tarjetas = [
      ...Array.from({ length: 15 }, (_, i) => ({ id: `n${i}`, mazo: "js", creada: `2026-11-${10 + (i % 9)}` })),
      { id: "r1", mazo: "js", rep: { proxima: "2026-11-18" } },
      { id: "r2", mazo: "ingles", rep: { proxima: "2026-11-19" } },
      { id: "r3", mazo: "js", rep: { proxima: "2026-11-25" } },
    ];
    const todo = colaDeHoy(tarjetas, { hoy });
    expect(todo.repasos).toBe(2);
    expect(todo.nuevas).toBe(10);
    expect(todo.cola[0].id).toBe("r1");
    expect(todo.esperando).toBe(5);
    const js = colaDeHoy(tarjetas, { hoy, mazo: "js", hechasHoy: { nuevas: 8, repasos: 0 } });
    expect(js.repasos).toBe(1);
    expect(js.nuevas).toBe(2);
  });
});
