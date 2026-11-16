import { test, expect } from "vitest";
import { iniciales } from "./solucion.js";

test("el avatar no queda vacío: devuelve las iniciales", () => {
  expect(iniciales("Ana Torres")).toBe("AT");
});

test("pone las iniciales en mayúscula", () => {
  expect(iniciales("maría elena quispe")).toBe("MEQ");
});

test("ignora los espacios de más", () => {
  expect(iniciales("  luis   paredes ")).toBe("LP");
});

test("con un solo nombre devuelve una letra", () => {
  expect(iniciales("Rosa")).toBe("R");
});
