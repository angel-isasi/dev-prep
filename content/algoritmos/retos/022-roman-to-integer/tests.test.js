import { test, expect } from "vitest";
import { romanoAEntero } from "./solucion.js";

test("solo sumas con repetidos: III da 3", () => {
  expect(romanoAEntero("III")).toBe(3);
});

test("solo sumas de mayor a menor: LVIII da 58", () => {
  expect(romanoAEntero("LVIII")).toBe(58);
});

test("las seis restas: IV, IX, XL, XC, CD, CM", () => {
  expect(romanoAEntero("IV")).toBe(4);
  expect(romanoAEntero("IX")).toBe(9);
  expect(romanoAEntero("XL")).toBe(40);
  expect(romanoAEntero("XC")).toBe(90);
  expect(romanoAEntero("CD")).toBe(400);
  expect(romanoAEntero("CM")).toBe(900);
});

test("sumas y restas mezcladas: MCMXCIV da 1994", () => {
  expect(romanoAEntero("MCMXCIV")).toBe(1994);
});

test("un solo símbolo: I da 1 y M da 1000", () => {
  expect(romanoAEntero("I")).toBe(1);
  expect(romanoAEntero("M")).toBe(1000);
});

test("el mayor posible: MMMCMXCIX da 3999", () => {
  expect(romanoAEntero("MMMCMXCIX")).toBe(3999);
});
