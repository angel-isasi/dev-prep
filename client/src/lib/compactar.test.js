import { test, expect } from "vitest";
import { compactar } from "./compactar.js";

test("arreglo corto en una línea", () => {
  expect(compactar("[\n  0,\n  1,\n]")).toBe("[0, 1]");
});

test("objeto corto en una línea", () => {
  expect(compactar('{\n  "a": 2,\n  "b": 1,\n}')).toBe('{ "a": 2, "b": 1 }');
});

test("deja igual los valores largos", () => {
  const largo = "[\n" + "  1234567890,\n".repeat(10) + "]";
  expect(compactar(largo)).toBe(largo);
});

test("deja igual lo que no es texto", () => {
  expect(compactar(null)).toBe(null);
});
