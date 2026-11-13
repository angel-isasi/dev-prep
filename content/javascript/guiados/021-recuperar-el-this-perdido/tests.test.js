import { test, expect } from "vitest";
import { Contador, crearEmisor, registrar } from "./solucion.js";

test("registrar no llama a sumar todavía", () => {
  const contador = new Contador();
  const emisor = crearEmisor();
  registrar(contador, emisor);
  expect(contador.clics).toBe(0);
});

test("una emisión suma 1", () => {
  const contador = new Contador();
  const emisor = crearEmisor();
  registrar(contador, emisor);
  emisor.emitir();
  expect(contador.clics).toBe(1);
});

test("tres emisiones suman 3", () => {
  const contador = new Contador();
  const emisor = crearEmisor();
  registrar(contador, emisor);
  emisor.emitir();
  emisor.emitir();
  emisor.emitir();
  expect(contador.clics).toBe(3);
});

test("cada contador lleva su propia cuenta", () => {
  const a = new Contador();
  const b = new Contador();
  const emisor = crearEmisor();
  registrar(a, emisor);
  registrar(b, emisor);
  registrar(b, emisor);
  emisor.emitir();
  emisor.emitir();
  expect(a.clics).toBe(2);
  expect(b.clics).toBe(4);
});

test("funciona aunque el emisor llame a la función como método suyo", () => {
  const contador = new Contador();
  // Este emisor guarda la función en this.fn y la llama con this.fn():
  // ahí this sería el emisor, no el contador.
  const emisor = {
    on(fn) {
      this.fn = fn;
    },
    emitir() {
      this.fn();
    },
  };
  registrar(contador, emisor);
  emisor.emitir();
  expect(contador.clics).toBe(1);
  expect(emisor.clics).toBeUndefined();
});
