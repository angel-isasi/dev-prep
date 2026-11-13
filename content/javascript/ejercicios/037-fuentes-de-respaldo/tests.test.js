import { test, expect, vi } from "vitest";
import { intentarEnOrden } from "./solucion.js";

const caido = async () => {
  throw new Error("caído");
};

test("devuelve el resultado de la primera fuente que funciona", async () => {
  expect(await intentarEnOrden([caido, async () => "respaldo", async () => "nunca"])).toBe("respaldo");
});

test("no llama a las fuentes que vienen después de la que funcionó", async () => {
  const principal = vi.fn(async () => "principal");
  const respaldo = vi.fn(async () => "respaldo");

  expect(await intentarEnOrden([principal, respaldo])).toBe("principal");
  expect(principal).toHaveBeenCalledTimes(1);
  expect(respaldo).not.toHaveBeenCalled();
});

test("las prueba una por una: la siguiente empieza cuando la anterior falló", async () => {
  const registro = [];
  const lenta = async () => {
    registro.push("empieza lenta");
    await new Promise((resolver) => setTimeout(resolver, 30));
    registro.push("falla lenta");
    throw new Error("lenta caída");
  };
  const rapida = async () => {
    registro.push("empieza rápida");
    return "rápida";
  };

  expect(await intentarEnOrden([lenta, rapida])).toBe("rápida");
  expect(registro).toEqual(["empieza lenta", "falla lenta", "empieza rápida"]);
});

test("un resultado 'falsy' (0, null, \"\") también cuenta como éxito", async () => {
  const otra = vi.fn(async () => "otra");
  expect(await intentarEnOrden([async () => 0, otra])).toBe(0);
  expect(otra).not.toHaveBeenCalled();
});

test("si todas fallan, rechaza con el error de la última", async () => {
  const otroCaido = async () => {
    throw new Error("también caído");
  };
  await expect(intentarEnOrden([caido])).rejects.toThrow("caído");
  await expect(intentarEnOrden([caido, otroCaido])).rejects.toThrow("también caído");
});

test("con una lista vacía rechaza con 'No hay fuentes'", async () => {
  await expect(intentarEnOrden([])).rejects.toThrow("No hay fuentes");
});
