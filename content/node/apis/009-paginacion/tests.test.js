import { test, expect, beforeAll, afterAll } from "vitest";
import { crearApp } from "./solucion.js";

let servidor, url;
beforeAll(() => {
  servidor = crearApp().listen(0);
  url = `http://127.0.0.1:${servidor.address().port}`;
});
afterAll(() => servidor.close());

/** GET /articulos con la query indicada; devuelve el cuerpo y los ids de la página. */
async function pedir(query = "") {
  const r = await fetch(`${url}/articulos${query}`);
  expect(r.status).toBe(200);
  const cuerpo = await r.json();
  return { ...cuerpo, ids: cuerpo.datos.map((a) => a.id) };
}

/** Números del desde al hasta, inclusive. */
const rango = (desde, hasta) => Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);

test("sin parámetros: página 1, 10 artículos y los metadatos", async () => {
  const r = await pedir();
  expect(r.ids).toEqual(rango(1, 10));
  expect(r.datos[0]).toEqual({ id: 1, titulo: "Artículo 1" });
  expect(r).toMatchObject({ pagina: 1, limite: 10, total: 23, paginas: 3 });
});

test("?page=2 devuelve del 11 al 20", async () => {
  const r = await pedir("?page=2");
  expect(r.ids).toEqual(rango(11, 20));
  expect(r.pagina).toBe(2);
});

test("la última página puede venir incompleta: ?page=3 devuelve 21, 22 y 23", async () => {
  const r = await pedir("?page=3");
  expect(r.ids).toEqual([21, 22, 23]);
});

test("?page=2&limit=5 devuelve del 6 al 10 y recalcula las páginas (5)", async () => {
  const r = await pedir("?page=2&limit=5");
  expect(r.ids).toEqual(rango(6, 10));
  expect(r).toMatchObject({ pagina: 2, limite: 5, total: 23, paginas: 5 });
});

test("?limit=100 se recorta a 50", async () => {
  const r = await pedir("?limit=100");
  expect(r.ids).toHaveLength(23);
  expect(r).toMatchObject({ limite: 50, paginas: 1 });
});

test("una página fuera de rango responde 200 con datos vacíos", async () => {
  const r = await pedir("?page=9");
  expect(r.datos).toEqual([]);
  expect(r).toMatchObject({ pagina: 9, limite: 10, total: 23, paginas: 3 });
});

test("page o limit inválidos (0, -1, abc, 2.5) responden 400", async () => {
  for (const query of ["?page=0", "?limit=-1", "?page=abc", "?limit=2.5"]) {
    const r = await fetch(`${url}/articulos${query}`);
    expect(r.status, query).toBe(400);
    expect(await r.json()).toEqual({ error: "page y limit deben ser enteros positivos" });
  }
});
