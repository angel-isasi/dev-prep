import { test, expect } from "vitest";
import { sinRepetidos } from "./solucion.js";

test("ejemplo clásico: \"abcabcbb\" da 3", () => {
  expect(sinRepetidos("abcabcbb")).toBe(3);
});

test("todo igual: \"bbbbb\" da 1", () => {
  expect(sinRepetidos("bbbbb")).toBe(1);
});

test("la respuesta está en medio: \"pwwkew\" da 3 (\"wke\")", () => {
  expect(sinRepetidos("pwwkew")).toBe(3);
});

test("cadena vacía da 0 y un espacio da 1", () => {
  expect(sinRepetidos("")).toBe(0);
  expect(sinRepetidos(" ")).toBe(1);
});

test("no reiniciar desde cero al repetir: \"dvdf\" da 3 (\"vdf\")", () => {
  expect(sinRepetidos("dvdf")).toBe(3);
});

test("la aparición anterior quedó fuera de la ventana: \"abba\" da 2", () => {
  expect(sinRepetidos("abba")).toBe(2);
});
