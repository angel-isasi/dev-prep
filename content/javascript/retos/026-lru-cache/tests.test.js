import { test, expect } from "vitest";
import { LRUCache } from "./solucion.js";

test("leer una clave la protege: se expulsa la que se usó hace más tiempo", () => {
  const c = new LRUCache(2);
  c.put(1, 1);
  c.put(2, 2);
  expect(c.get(1)).toBe(1);
  c.put(3, 3);
  expect(c.get(2), "la 2 debió ser expulsada").toBe(-1);
  expect(c.get(3)).toBe(3);
  expect(c.get(1)).toBe(1);
});

test("sin lecturas, se expulsa la primera que entró", () => {
  const c = new LRUCache(2);
  c.put("a", "A");
  c.put("b", "B");
  c.put("c", "C");
  expect(c.get("a")).toBe(-1);
  expect(c.get("b")).toBe("B");
  expect(c.get("c")).toBe("C");
});

test("una clave que no existe devuelve -1", () => {
  const c = new LRUCache(3);
  expect(c.get("nada")).toBe(-1);
});

test("actualizar una clave cambia su valor, la renueva y no expulsa a nadie", () => {
  const c = new LRUCache(2);
  c.put(1, 1);
  c.put(2, 2);
  c.put(1, 10);
  expect(c.get(2), "actualizar no debe expulsar").toBe(2);
  c.put(3, 3);
  expect(c.get(1), "la 1 se usó antes que la 2: debió ser expulsada").toBe(-1);
  expect(c.get(2)).toBe(2);
  expect(c.get(3)).toBe(3);
});

test("con capacidad 1 solo guarda la última", () => {
  const c = new LRUCache(1);
  c.put("x", 1);
  c.put("y", 2);
  expect(c.get("x")).toBe(-1);
  expect(c.get("y")).toBe(2);
});
