import { test, expect } from "vitest";
import { Pila } from "./solucion.js";

test("desapilar devuelve el último elemento que entró", () => {
  const pila = new Pila().apilar("a").apilar("b");
  expect(pila.desapilar()).toBe("b");
  expect(pila.desapilar()).toBe("a");
});

test("apilar devuelve la misma pila para poder encadenar", () => {
  const pila = new Pila();
  expect(pila.apilar("a")).toBe(pila);
});

test("verTope muestra el de arriba sin sacarlo", () => {
  const pila = new Pila().apilar("a").apilar("b");
  expect(pila.verTope()).toBe("b");
  expect(pila.verTope()).toBe("b");
  expect(pila.tamano).toBe(2);
});

test("tamano es una propiedad que se actualiza", () => {
  const pila = new Pila().apilar("a").apilar("b");
  pila.desapilar();
  expect(pila.verTope()).toBe("a");
  expect(pila.tamano).toBe(1);
});

test("una pila vacía devuelve undefined y tiene tamaño 0", () => {
  const pila = new Pila();
  expect(pila.desapilar()).toBeUndefined();
  expect(pila.verTope()).toBeUndefined();
  expect(pila.tamano).toBe(0);
});
