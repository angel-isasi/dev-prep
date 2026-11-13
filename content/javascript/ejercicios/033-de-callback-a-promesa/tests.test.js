import { test, expect } from "vitest";
import { promisificar } from "./solucion.js";

function leer(nombre, cb) {
  setTimeout(() => {
    if (!nombre) cb(new Error("sin nombre"));
    else cb(null, `contenido de ${nombre}`);
  }, 5);
}

test("devuelve una función", () => {
  expect(typeof promisificar(leer)).toBe("function");
});

test("la nueva función devuelve una promesa", () => {
  const leerAsync = promisificar(leer);
  const resultado = leerAsync("notas.txt");
  expect(resultado).toBeInstanceOf(Promise);
  return resultado;
});

test("se cumple con el dato cuando no hay error", async () => {
  const leerAsync = promisificar(leer);
  expect(await leerAsync("notas.txt")).toBe("contenido de notas.txt");
});

test("se rechaza con el error cuando el callback recibe un error", async () => {
  const leerAsync = promisificar(leer);
  await expect(leerAsync("")).rejects.toThrow("sin nombre");
});

test("pasa todos los argumentos a la función original", async () => {
  const sumar = (a, b, c, cb) => setTimeout(() => cb(null, a + b + c), 1);
  expect(await promisificar(sumar)(1, 2, 3)).toBe(6);
});
