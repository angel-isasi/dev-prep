import { test, expect, vi } from "vitest";
import { enSerie } from "./solucion.js";

// Crea una tarea que anota cuándo empieza y cuándo termina.
function crearTarea(nombre, ms, registro) {
  return () =>
    new Promise((resolver) => {
      registro.push(`empieza ${nombre}`);
      setTimeout(() => {
        registro.push(`termina ${nombre}`);
        resolver(nombre);
      }, ms);
    });
}

test("devuelve los resultados en el orden de las tareas", async () => {
  const registro = [];
  const resultado = await enSerie([crearTarea("lenta", 30, registro), crearTarea("rápida", 5, registro)]);
  expect(resultado).toEqual(["lenta", "rápida"]);
});

test("cada tarea empieza solo cuando terminó la anterior", async () => {
  const registro = [];
  await enSerie([crearTarea("lenta", 30, registro), crearTarea("rápida", 5, registro)]);
  expect(registro).toEqual(["empieza lenta", "termina lenta", "empieza rápida", "termina rápida"]);
});

test("con una lista vacía devuelve []", async () => {
  expect(await enSerie([])).toEqual([]);
});

test("si una tarea falla, rechaza con ese error y no ejecuta las siguientes", async () => {
  const registro = [];
  const ultima = vi.fn(async () => "c");
  const falla = () => Promise.reject(new Error("se cayó"));

  await expect(enSerie([crearTarea("a", 5, registro), falla, ultima])).rejects.toThrow("se cayó");
  expect(registro).toEqual(["empieza a", "termina a"]);
  expect(ultima).not.toHaveBeenCalled();
});
