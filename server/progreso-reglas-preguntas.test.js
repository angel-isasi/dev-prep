import { test, expect } from "vitest";
import { calificarPregunta, preguntaPendiente } from "./progreso-reglas.js";

const HOY = "2026-11-13";

test("la primera vez que la sabes va a la caja 1 (mañana)", () => {
  expect(calificarPregunta(undefined, "sabia", HOY)).toEqual({ caja: 1, proximo: "2026-11-14", ultima: "sabia", vistas: 1 });
});

test("si la sabes otra vez sube de caja", () => {
  const r = calificarPregunta({ caja: 2, proximo: HOY, vistas: 3 }, "sabia", HOY);
  expect(r.caja).toBe(3);
  expect(r.proximo).toBe("2026-11-20");
});

test("si dudas se queda en su caja", () => {
  expect(calificarPregunta({ caja: 3, proximo: HOY }, "dude", HOY).caja).toBe(3);
});

test("si no la sabías vuelve a la caja 1", () => {
  expect(calificarPregunta({ caja: 4, proximo: HOY }, "no", HOY).caja).toBe(1);
});

test("pendiente solo si ya la viste y le toca", () => {
  expect(preguntaPendiente(undefined, HOY)).toBe(false);
  expect(preguntaPendiente({ proximo: "2026-11-13" }, HOY)).toBe(true);
  expect(preguntaPendiente({ proximo: "2026-11-14" }, HOY)).toBe(false);
});
