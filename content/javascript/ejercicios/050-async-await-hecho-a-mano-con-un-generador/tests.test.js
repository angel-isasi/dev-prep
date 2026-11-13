import { test, expect } from "vitest";
import { ejecutar } from "./solucion.js";

const pedir = (valor) => new Promise((resolver) => setTimeout(() => resolver(valor), 5));

test("devuelve una promesa con lo que retorna el generador", async () => {
  const promesa = ejecutar(function* () {
    return "listo";
  });
  expect(promesa).toBeInstanceOf(Promise);
  expect(await promesa).toBe("listo");
});

test("le devuelve al generador el resultado de cada promesa", async () => {
  const total = await ejecutar(function* () {
    const a = yield pedir(10);
    const b = yield pedir(a * 2);
    return a + b;
  });
  expect(total).toBe(30);
});

test("espera las promesas en orden, una después de otra", async () => {
  const vistos = [];
  await ejecutar(function* () {
    vistos.push(yield pedir("primero"));
    vistos.push(yield pedir("segundo"));
    vistos.push(yield pedir("tercero"));
  });
  expect(vistos).toEqual(["primero", "segundo", "tercero"]);
});

test("acepta yield de valores que no son promesas", async () => {
  const total = await ejecutar(function* () {
    const a = yield 5;
    const b = yield pedir(a + 1);
    return a + b;
  });
  expect(total).toBe(11);
});

test("si una promesa se rechaza, la promesa de ejecutar se rechaza", async () => {
  const promesa = ejecutar(function* () {
    yield Promise.reject(new Error("falló"));
    return "no debería llegar aquí";
  });
  await expect(promesa).rejects.toThrow("falló");
});

test("si el generador lanza un error, la promesa de ejecutar se rechaza", async () => {
  const promesa = ejecutar(function* () {
    const a = yield pedir(1);
    throw new Error(`error después de recibir ${a}`);
  });
  await expect(promesa).rejects.toThrow("error después de recibir 1");
});
