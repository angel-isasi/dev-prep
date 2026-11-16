import { test, expect } from "vitest";
import { misTests } from "./solucion.js";

// ---------------------------------------------------------------------------
// La función correcta y 5 versiones con un error escondido ("mutantes").
// Tus tests deben pasar con la correcta y fallar con cada mutante.
// ---------------------------------------------------------------------------

function correcta(lista, pagina, porPagina) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
  const actual = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (actual - 1) * porPagina;
  return { items: lista.slice(inicio, inicio + porPagina), pagina: actual, totalPaginas };
}

const mutantes = [
  {
    nombre: "una versión que cuenta las páginas desde 0",
    fn: (lista, pagina, porPagina) => {
      const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
      const actual = Math.min(Math.max(1, pagina), totalPaginas);
      const inicio = actual * porPagina;
      return { items: lista.slice(inicio, inicio + porPagina), pagina: actual, totalPaginas };
    },
  },
  {
    nombre: "una versión que redondea el total de páginas hacia abajo",
    fn: (lista, pagina, porPagina) => {
      const totalPaginas = Math.max(1, Math.floor(lista.length / porPagina));
      const actual = Math.min(Math.max(1, pagina), totalPaginas);
      const inicio = (actual - 1) * porPagina;
      return { items: lista.slice(inicio, inicio + porPagina), pagina: actual, totalPaginas };
    },
  },
  {
    nombre: "una versión que no corrige una página mayor que el total",
    fn: (lista, pagina, porPagina) => {
      const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
      const actual = Math.max(1, pagina);
      const inicio = (actual - 1) * porPagina;
      return { items: lista.slice(inicio, inicio + porPagina), pagina: actual, totalPaginas };
    },
  },
  {
    nombre: "una versión que no corrige una página menor que 1",
    fn: (lista, pagina, porPagina) => {
      const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
      const actual = Math.min(pagina, totalPaginas);
      const inicio = (actual - 1) * porPagina;
      return { items: lista.slice(inicio, inicio + porPagina), pagina: actual, totalPaginas };
    },
  },
  {
    nombre: "una versión que da 0 páginas a la lista vacía",
    fn: (lista, pagina, porPagina) => {
      const totalPaginas = Math.ceil(lista.length / porPagina);
      const actual = Math.min(Math.max(1, pagina), totalPaginas);
      const inicio = (actual - 1) * porPagina;
      return { items: lista.slice(inicio, inicio + porPagina), pagina: actual, totalPaginas };
    },
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
