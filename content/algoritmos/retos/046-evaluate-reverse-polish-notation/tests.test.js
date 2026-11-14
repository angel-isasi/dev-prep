import { test, expect } from "vitest";
import { evaluarRPN } from "./solucion.js";

test("suma y multiplicación: [\"2\", \"1\", \"+\", \"3\", \"*\"] da 9", () => {
  expect(evaluarRPN(["2", "1", "+", "3", "*"])).toBe(9);
});

test("división dentro de una suma: [\"4\", \"13\", \"5\", \"/\", \"+\"] da 6", () => {
  expect(evaluarRPN(["4", "13", "5", "/", "+"])).toBe(6);
});

test("el orden importa en la resta y la división", () => {
  expect(evaluarRPN(["5", "3", "-"])).toBe(2);
  expect(evaluarRPN(["8", "2", "/"])).toBe(4);
});

test("la división trunca hacia cero, también con negativos", () => {
  expect(evaluarRPN(["7", "2", "/"])).toBe(3);
  expect(evaluarRPN(["-7", "2", "/"])).toBe(-3);
});

test("un solo número, también negativo", () => {
  expect(evaluarRPN(["42"])).toBe(42);
  expect(evaluarRPN(["-3"])).toBe(-3);
});

test("expresión larga: (10 * (6 / ((9 + 3) * -11))) + 17 + 5 da 22", () => {
  expect(evaluarRPN(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"])).toBe(22);
});

test("números de varias cifras: [\"100\", \"25\", \"-\", \"3\", \"*\"] da 225", () => {
  expect(evaluarRPN(["100", "25", "-", "3", "*"])).toBe(225);
});
