import { test, expect } from "vitest";
import { MinStack } from "./solucion.js";

test("ejemplo clásico: push -2, 0, -3; getMin, pop, top, getMin", () => {
  const pila = new MinStack();
  pila.push(-2);
  pila.push(0);
  pila.push(-3);
  expect(pila.getMin()).toBe(-3);
  pila.pop();
  expect(pila.top()).toBe(0);
  expect(pila.getMin()).toBe(-2);
});

test("pop devuelve el elemento que saca", () => {
  const pila = new MinStack();
  pila.push(5);
  pila.push(8);
  expect(pila.pop()).toBe(8);
  expect(pila.pop()).toBe(5);
});

test("top no saca el elemento", () => {
  const pila = new MinStack();
  pila.push(4);
  pila.push(9);
  expect(pila.top()).toBe(9);
  expect(pila.top()).toBe(9);
  expect(pila.getMin()).toBe(4);
});

test("el mínimo se recupera al sacar: push 5, 3, 7 y luego pop, pop", () => {
  const pila = new MinStack();
  pila.push(5);
  pila.push(3);
  pila.push(7);
  expect(pila.getMin()).toBe(3);
  pila.pop(); // saca 7
  expect(pila.getMin()).toBe(3);
  pila.pop(); // saca 3
  expect(pila.getMin()).toBe(5);
});

test("mínimo repetido: sacar uno no borra el otro", () => {
  const pila = new MinStack();
  pila.push(0);
  pila.push(1);
  pila.push(0);
  expect(pila.getMin()).toBe(0);
  pila.pop();
  expect(pila.getMin()).toBe(0);
});

test("cada pila es independiente", () => {
  const a = new MinStack();
  const b = new MinStack();
  a.push(1);
  b.push(10);
  expect(a.getMin()).toBe(1);
  expect(b.getMin()).toBe(10);
  expect(b.top()).toBe(10);
});
