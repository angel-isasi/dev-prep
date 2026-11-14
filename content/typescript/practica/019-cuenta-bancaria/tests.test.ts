import { test, expect, expectTypeOf } from "vitest";
import { CuentaBancaria, type Movimiento } from "./solucion";

test("empieza con el saldo inicial (0 por defecto) y guarda el titular", () => {
  const cuenta = new CuentaBancaria("Ana", 100);
  expect(cuenta.verSaldo()).toBe(100);
  expect(cuenta.titular).toBe("Ana");
  expect(new CuentaBancaria("Luis").verSaldo()).toBe(0);
});

test("depositar y retirar cambian el saldo", () => {
  const cuenta = new CuentaBancaria("Ana", 100);
  cuenta.depositar(50);
  cuenta.retirar(30);
  expect(cuenta.verSaldo()).toBe(120);
});

test("retirar más del saldo lanza \"Saldo insuficiente\" y no cambia nada", () => {
  const cuenta = new CuentaBancaria("Ana", 100);
  expect(() => cuenta.retirar(500)).toThrow("Saldo insuficiente");
  expect(cuenta.verSaldo()).toBe(100);
  expect(cuenta.historial()).toEqual([]);
});

test("montos de 0 o negativos lanzan error", () => {
  const cuenta = new CuentaBancaria("Ana", 100);
  expect(() => cuenta.depositar(0)).toThrow("El monto debe ser mayor que cero");
  expect(() => cuenta.retirar(-20)).toThrow("El monto debe ser mayor que cero");
  expect(cuenta.verSaldo()).toBe(100);
});

test("un saldo inicial negativo lanza error", () => {
  expect(() => new CuentaBancaria("Ana", -5)).toThrow("El saldo inicial no puede ser negativo");
});

test("historial registra los movimientos y devuelve una copia", () => {
  const cuenta = new CuentaBancaria("Ana", 100);
  cuenta.depositar(50);
  cuenta.retirar(30);
  const historial = cuenta.historial();
  expect(historial).toEqual([
    { tipo: "deposito", monto: 50 },
    { tipo: "retiro", monto: 30 },
  ]);
  historial.push({ tipo: "deposito", monto: 1000 });
  expect(cuenta.historial()).toHaveLength(2);
});

test("saldo es privado y titular de solo lectura (lo revisa tsc)", () => {
  const cuenta = new CuentaBancaria("Ana", 100);
  expectTypeOf(cuenta.verSaldo()).toEqualTypeOf<number>();
  expectTypeOf(cuenta.historial()).toEqualTypeOf<Movimiento[]>();
  expectTypeOf(cuenta.titular).toEqualTypeOf<string>();
  const probar = () => {
    // @ts-expect-error saldo es privado: solo se lee con verSaldo()
    console.log(cuenta.saldo);
    // @ts-expect-error titular es de solo lectura
    cuenta.titular = "Luis";
    // @ts-expect-error movimientos es privado: usa historial()
    cuenta.movimientos.push({ tipo: "deposito", monto: 1 });
  };
  expect(typeof probar).toBe("function");
});
