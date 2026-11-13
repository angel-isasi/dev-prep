import { test, expect } from "vitest";
import { mapAsync } from "./solucion.js";

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

test("aplica la función asíncrona y devuelve los valores ya resueltos", async () => {
  const doblar = async (n) => {
    await esperar(5);
    return n * 2;
  };
  expect(await mapAsync([1, 2, 3], doblar)).toEqual([2, 4, 6]);
});

test("mantiene el orden de la lista aunque terminen en otro orden", async () => {
  // El primero tarda más que el último.
  const lento = async (n) => {
    await esperar(40 - n * 10);
    return `listo ${n}`;
  };
  expect(await mapAsync([1, 2, 3], lento)).toEqual(["listo 1", "listo 2", "listo 3"]);
});

test("corre todas las llamadas en paralelo, no una por una", async () => {
  let activas = 0;
  let maximo = 0;
  const contar = async (n) => {
    activas++;
    maximo = Math.max(maximo, activas);
    await esperar(20);
    activas--;
    return n;
  };
  await mapAsync([1, 2, 3, 4], contar);
  expect(maximo, "deberían haber estado las 4 corriendo a la vez").toBe(4);
});

test("la función recibe el elemento y su índice", async () => {
  expect(await mapAsync(["a", "b", "c"], async (x, i) => x + i)).toEqual(["a0", "b1", "c2"]);
});

test("con una lista vacía devuelve []", async () => {
  expect(await mapAsync([], async (x) => x)).toEqual([]);
});

test("si una llamada falla, rechaza con ese error", async () => {
  const fallaConDos = async (n) => {
    if (n === 2) throw new Error("falló el 2");
    return n;
  };
  await expect(mapAsync([1, 2, 3], fallaConDos)).rejects.toThrow("falló el 2");
});
