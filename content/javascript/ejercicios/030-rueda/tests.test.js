import { test, expect } from "vitest";
import { rueda } from "./solucion.js";

test("alterna entre dos valores", () => {
  const turno = rueda("X", "O");
  expect([turno(), turno(), turno()]).toEqual(["X", "O", "X"]);
});

test("con tres valores da varias vueltas completas", () => {
  const semaforo = rueda("verde", "amarillo", "rojo");
  const vistos = [];
  for (let i = 0; i < 7; i++) vistos.push(semaforo());
  expect(vistos).toEqual(["verde", "amarillo", "rojo", "verde", "amarillo", "rojo", "verde"]);
});

test("con un solo valor siempre devuelve ese", () => {
  const siempre = rueda(42);
  expect([siempre(), siempre(), siempre()]).toEqual([42, 42, 42]);
});

test("cada rueda lleva su propia posición", () => {
  const a = rueda("a1", "a2");
  const b = rueda("b1", "b2");
  a();
  expect(b()).toBe("b1");
  expect(a()).toBe("a2");
});
