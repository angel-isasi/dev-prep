import { test, expect } from "vitest";
import { calificar } from "./solucion.js";

test("notas desaprobatorias, incluso con decimales", () => {
  expect(calificar(0)).toBe("desaprobado");
  expect(calificar(8)).toBe("desaprobado");
  expect(calificar(10.5)).toBe("desaprobado");
});

test("de 11 a menos de 14 es aprobado", () => {
  expect(calificar(11)).toBe("aprobado");
  expect(calificar(13)).toBe("aprobado");
});

test("de 14 a menos de 18 es bueno", () => {
  expect(calificar(14)).toBe("bueno");
  expect(calificar(17.9)).toBe("bueno");
});

test("de 18 a 20 es excelente", () => {
  expect(calificar(18)).toBe("excelente");
  expect(calificar(20)).toBe("excelente");
});

test("fuera de 0 a 20 es nota inválida", () => {
  expect(calificar(-1)).toBe("nota inválida");
  expect(calificar(21)).toBe("nota inválida");
});
