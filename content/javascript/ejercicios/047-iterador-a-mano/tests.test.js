import { test, expect } from "vitest";
import { crearIterador } from "./solucion.js";

test("entrega los elementos en orden", () => {
  const it = crearIterador(["a", "b"]);
  expect(it.siguiente()).toEqual({ valor: "a", listo: false });
  expect(it.siguiente()).toEqual({ valor: "b", listo: false });
});

test("al terminar devuelve listo: true y valor undefined", () => {
  const it = crearIterador(["a", "b"]);
  it.siguiente();
  it.siguiente();
  expect(it.siguiente()).toEqual({ valor: undefined, listo: true });
});

test("después de terminar sigue diciendo que está listo", () => {
  const it = crearIterador(["a"]);
  it.siguiente();
  it.siguiente();
  expect(it.siguiente()).toEqual({ valor: undefined, listo: true });
});

test("con un arreglo vacío termina de inmediato", () => {
  expect(crearIterador([]).siguiente()).toEqual({ valor: undefined, listo: true });
});

test("cada iterador recuerda su propia posición", () => {
  const lista = [10, 20, 30];
  const it1 = crearIterador(lista);
  const it2 = crearIterador(lista);
  it1.siguiente();
  it1.siguiente();
  expect(it2.siguiente().valor).toBe(10);
  expect(it1.siguiente().valor).toBe(30);
  expect(lista).toEqual([10, 20, 30]);
});

test("los valores falsy también se entregan", () => {
  const it = crearIterador([0, ""]);
  expect(it.siguiente()).toEqual({ valor: 0, listo: false });
  expect(it.siguiente()).toEqual({ valor: "", listo: false });
  expect(it.siguiente().listo).toBe(true);
});
