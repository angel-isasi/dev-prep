import { test, expect, beforeAll, afterAll } from "vitest";
import { crearApp } from "./solucion.js";

let servidor, url;
beforeAll(() => {
  servidor = crearApp().listen(0);
  url = `http://127.0.0.1:${servidor.address().port}`;
});
afterAll(() => servidor.close());

/** Hace el GET y devuelve solo los nombres, para comparar fácil. */
async function nombres(query) {
  const r = await fetch(`${url}/productos${query}`);
  expect(r.status).toBe(200);
  return (await r.json()).map((p) => p.nombre);
}

test("sin filtros devuelve los 6 productos en su orden", async () => {
  expect(await nombres("")).toEqual(["Teclado", "Mouse", "Monitor", "Audífonos", "Parlante", "Webcam"]);
});

test("?categoria=audio devuelve solo los de audio", async () => {
  expect(await nombres("?categoria=audio")).toEqual(["Audífonos", "Parlante"]);
});

test("?max=100 convierte el texto a número y filtra por precio", async () => {
  expect(await nombres("?max=100")).toEqual(["Mouse", "Audífonos"]);
});

test("?max=150 incluye el producto que cuesta exactamente 150", async () => {
  expect(await nombres("?max=150")).toEqual(["Teclado", "Mouse", "Audífonos", "Parlante"]);
});

test("los dos filtros se combinan: ?categoria=perifericos&max=150", async () => {
  expect(await nombres("?categoria=perifericos&max=150")).toEqual(["Teclado", "Mouse"]);
});

test("una categoría sin productos responde 200 con []", async () => {
  expect(await nombres("?categoria=juguetes")).toEqual([]);
});

test("?max=barato responde 400 con { error: \"max debe ser un número\" }", async () => {
  const r = await fetch(`${url}/productos?max=barato`);
  expect(r.status).toBe(400);
  expect(await r.json()).toEqual({ error: "max debe ser un número" });
});

test("un parámetro vacío (?max=) se ignora", async () => {
  expect(await nombres("?max=")).toHaveLength(6);
});
