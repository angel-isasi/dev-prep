import { test, expect } from "vitest";
import { primerUnico } from "./solucion.js";

test("el primero ya es único: \"leetcode\" da 0", () => {
  expect(primerUnico("leetcode")).toBe(0);
});

test("el único está en medio: \"loveleetcode\" da 2", () => {
  expect(primerUnico("loveleetcode")).toBe(2);
});

test("todos se repiten: \"aabb\" da -1", () => {
  expect(primerUnico("aabb")).toBe(-1);
});

test("cadena vacía da -1 y un solo carácter da 0", () => {
  expect(primerUnico("")).toBe(-1);
  expect(primerUnico("z")).toBe(0);
});

test("el único está al final: \"dddccdbba\" da 8", () => {
  expect(primerUnico("dddccdbba")).toBe(8);
});

test("una letra que se repite más adelante no es única: \"abcabd\" da 2", () => {
  expect(primerUnico("abcabd")).toBe(2);
});

test("distingue mayúsculas: \"aAa\" da 1", () => {
  expect(primerUnico("aAa")).toBe(1);
});
