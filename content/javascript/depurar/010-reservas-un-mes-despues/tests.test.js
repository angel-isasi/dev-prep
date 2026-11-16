import { test, expect } from "vitest";
import { leerFecha } from "./solucion.js";

// getMonth() cuenta desde 0: enero es 0, marzo es 2, diciembre es 11.
const partes = (fecha) => [fecha.getDate(), fecha.getMonth() + 1, fecha.getFullYear()];

test("el 15/03 se guarda en marzo, no en abril", () => {
  expect(partes(leerFecha("15/03/2026"))).toEqual([15, 3, 2026]);
});

test("el 31/01 sigue siendo 31 de enero", () => {
  expect(partes(leerFecha("31/01/2026"))).toEqual([31, 1, 2026]);
});

test("diciembre se queda en su año", () => {
  expect(partes(leerFecha("01/12/2025"))).toEqual([1, 12, 2025]);
});

test("es la medianoche de ese día", () => {
  expect(leerFecha("15/03/2026").getTime()).toBe(new Date(2026, 2, 15).getTime());
});
