import { test, expect } from "vitest";
import { misTests } from "./solucion.js";

// ---------------------------------------------------------------------------
// La función correcta y 6 versiones con un error escondido ("mutantes").
// Tus tests deben pasar con la correcta y fallar con cada mutante.
// ---------------------------------------------------------------------------

const capitalizar = (palabra) => palabra[0].toUpperCase() + palabra.slice(1).toLowerCase();

function correcta(texto) {
  return texto.trim().split(/\s+/).filter(Boolean).map(capitalizar).join(" ");
}

const mutantes = [
  {
    nombre: "una versión que no quita los espacios del inicio y del final",
    fn: (texto) =>
      texto
        .replace(/\s+/g, " ")
        .split(" ")
        .map((p) => (p ? capitalizar(p) : p))
        .join(" "),
  },
  {
    nombre: "una versión que no junta los espacios repetidos",
    fn: (texto) =>
      texto
        .trim()
        .split(" ")
        .map((p) => (p ? capitalizar(p) : p))
        .join(" "),
  },
  {
    nombre: "una versión que no pasa a minúscula el resto de la palabra",
    fn: (texto) =>
      texto
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p[0].toUpperCase() + p.slice(1))
        .join(" "),
  },
  {
    nombre: "una versión que solo pone mayúscula a la primera palabra",
    fn: (texto) => {
      const limpio = texto.trim().split(/\s+/).filter(Boolean).join(" ").toLowerCase();
      return limpio ? limpio[0].toUpperCase() + limpio.slice(1) : "";
    },
  },
  {
    nombre: "una versión que no pone mayúscula a una inicial con tilde o ñ",
    fn: (texto) =>
      texto
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => {
          // Solo convierte de la a a la z: se olvida de á, é, ñ...
          const inicial = /[a-z]/.test(p[0]) ? p[0].toUpperCase() : p[0];
          return inicial + p.slice(1).toLowerCase();
        })
        .join(" "),
  },
  {
    nombre: "una versión que se rompe con un texto de solo espacios",
    fn: (texto) => texto.trim().split(/\s+/).map(capitalizar).join(" "),
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
