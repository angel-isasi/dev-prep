import { test, expect } from "vitest";
import { crearCuenta } from "./solucion.js";

test("depositar y retirar devuelven el saldo actualizado", () => {
  const cuenta = crearCuenta(100);
  expect(cuenta.depositar(50)).toBe(150);
  expect(cuenta.retirar(30)).toBe(120);
  expect(cuenta.verSaldo()).toBe(120);
});

test("el saldo no se puede leer como propiedad", () => {
  const cuenta = crearCuenta(100);
  expect(cuenta.saldo).toBeUndefined();
});

test("sin saldo inicial empieza en 0", () => {
  expect(crearCuenta().verSaldo()).toBe(0);
});

test("retirar más de lo que hay lanza 'Saldo insuficiente' y no cambia el saldo", () => {
  const cuenta = crearCuenta(120);
  expect(() => cuenta.retirar(999)).toThrow("Saldo insuficiente");
  expect(cuenta.verSaldo()).toBe(120);
});

test("depositar 0 o negativo lanza un error", () => {
  const cuenta = crearCuenta(10);
  expect(() => cuenta.depositar(0)).toThrow("El monto debe ser mayor que cero");
  expect(() => cuenta.depositar(-5)).toThrow("El monto debe ser mayor que cero");
  expect(cuenta.verSaldo()).toBe(10);
});

test("dos cuentas tienen saldos independientes", () => {
  const a = crearCuenta(100);
  const b = crearCuenta(100);
  a.retirar(60);
  expect(b.verSaldo()).toBe(100);
  expect(a.verSaldo()).toBe(40);
});
