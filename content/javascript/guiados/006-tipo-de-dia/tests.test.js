import { test, expect } from "vitest";
import { tipoDeDia } from "./solucion.js";

test("de lunes a viernes es laboral", () => {
  for (const dia of ["lunes", "martes", "miércoles", "jueves", "viernes"]) {
    expect(tipoDeDia(dia)).toBe("laboral");
  }
});

test("sábado y domingo son fin de semana", () => {
  expect(tipoDeDia("sábado")).toBe("fin de semana");
  expect(tipoDeDia("domingo")).toBe("fin de semana");
});

test("no distingue mayúsculas de minúsculas", () => {
  expect(tipoDeDia("Viernes")).toBe("laboral");
  expect(tipoDeDia("DOMINGO")).toBe("fin de semana");
});

test("cualquier otro texto es día inválido", () => {
  expect(tipoDeDia("feriado")).toBe("día inválido");
  expect(tipoDeDia("")).toBe("día inválido");
});
