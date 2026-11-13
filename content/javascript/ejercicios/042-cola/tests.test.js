import { test, expect } from "vitest";
import { Cola } from "./solucion.js";

test("atiende en orden de llegada", () => {
  const cola = new Cola().encolar("Ana").encolar("Luis").encolar("Rosa");
  expect(cola.atender()).toBe("Ana");
  expect(cola.atender()).toBe("Luis");
  expect(cola.atender()).toBe("Rosa");
});

test("encolar devuelve la misma cola para poder encadenar", () => {
  const cola = new Cola();
  expect(cola.encolar("Ana")).toBe(cola);
});

test("vacia es false mientras quede alguien", () => {
  const cola = new Cola().encolar("Ana").encolar("Luis");
  cola.atender();
  expect(cola.vacia).toBe(false);
});

test("vacia es true al inicio y cuando ya atendiste a todos", () => {
  const cola = new Cola();
  expect(cola.vacia).toBe(true);
  cola.encolar("Ana");
  cola.atender();
  expect(cola.vacia).toBe(true);
});

test("atender en una cola vacía devuelve undefined", () => {
  expect(new Cola().atender()).toBeUndefined();
});
