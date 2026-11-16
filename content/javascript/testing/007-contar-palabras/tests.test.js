import { test, expect } from "vitest";
import { misTests } from "./solucion.js";

// ---------------------------------------------------------------------------
// La función correcta y 6 versiones con un error escondido ("mutantes").
// Tus tests deben pasar con la correcta y fallar con cada mutante.
// ---------------------------------------------------------------------------

const SIGNOS = /[.,;:!?¡¿]/g;

function contar(palabras) {
  const conteo = {};
  for (const palabra of palabras) conteo[palabra] = (conteo[palabra] ?? 0) + 1;
  return conteo;
}

function correcta(texto) {
  return contar(texto.toLowerCase().replace(SIGNOS, " ").split(/\s+/).filter(Boolean));
}

const mutantes = [
  {
    nombre: "una versión que distingue mayúsculas",
    fn: (texto) => contar(texto.replace(SIGNOS, " ").split(/\s+/).filter(Boolean)),
  },
  {
    nombre: "una versión que no quita los signos de puntuación",
    fn: (texto) => contar(texto.toLowerCase().split(/\s+/).filter(Boolean)),
  },
  {
    nombre: "una versión que corta las palabras con tilde o ñ (usa \\w)",
    fn: (texto) => contar(texto.toLowerCase().match(/\w+/g) ?? []),
  },
  {
    nombre: "una versión que separa solo por espacios, no por saltos de línea",
    fn: (texto) => contar(texto.toLowerCase().replace(SIGNOS, " ").split(" ").filter(Boolean)),
  },
  {
    nombre: "una versión que cuenta cada palabra una sola vez",
    fn: (texto) => {
      const conteo = {};
      for (const palabra of texto.toLowerCase().replace(SIGNOS, " ").split(/\s+/).filter(Boolean)) {
        conteo[palabra] = 1;
      }
      return conteo;
    },
  },
  {
    nombre: "una versión que cuenta una palabra vacía cuando no hay texto",
    fn: (texto) => contar(texto.toLowerCase().replace(SIGNOS, " ").trim().split(/\s+/)),
  },
];

// ---------------------------------------------------------------------------
// Corre tus tests contra una versión de la función y cuenta cuántos fallan.
// ---------------------------------------------------------------------------
async function correrMisTests(fn) {
  const casos = [];
  misTests({ test: (nombre, cuerpo) => casos.push({ nombre, cuerpo }), expect }, fn);
  const fallidos = [];
  for (const caso of casos) {
    try {
      await caso.cuerpo();
    } catch (error) {
      fallidos.push(`"${caso.nombre}": ${error.message.split("\n")[0]}`);
    }
  }
  return { total: casos.length, fallidos };
}

test("escribiste al menos 3 tests", async () => {
  const { total } = await correrMisTests(correcta);
  expect(total, `Tienes ${total} test(s). Escribe al menos 3.`).toBeGreaterThanOrEqual(3);
});

test("tus tests pasan con la función correcta", async () => {
  const { fallidos } = await correrMisTests(correcta);
  expect(fallidos, `Estos tests fallan con la función correcta, así que esperan algo equivocado:\n${fallidos.join("\n")}`).toEqual([]);
});

for (const mutante of mutantes) {
  test(`atrapa ${mutante.nombre}`, async () => {
    const { fallidos } = await correrMisTests(mutante.fn);
    expect(fallidos.length, `Todos tus tests pasan con ${mutante.nombre}. Escribe un test que la haga fallar.`).toBeGreaterThan(0);
  });
}
