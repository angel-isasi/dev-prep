import { test, expect } from "vitest";
import { capitalizar } from "./solucion.js";

test("capitaliza cada palabra y pasa el resto a minúsculas", () => {
  expect(capitalizar("uNIVERSIDAD nacional de ica")).toBe("Universidad Nacional De Ica");
});

test("una sola palabra", () => {
  expect(capitalizar("lIMA")).toBe("Lima");
});

test("un texto ya capitalizado queda igual", () => {
  expect(capitalizar("Ana Lucía")).toBe("Ana Lucía");
});

test("respeta los espacios dobles", () => {
  expect(capitalizar("hola  mundo")).toBe("Hola  Mundo");
});

test("un texto vacío devuelve un texto vacío", () => {
  expect(capitalizar("")).toBe("");
});
