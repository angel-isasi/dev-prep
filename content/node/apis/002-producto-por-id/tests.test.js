import { test, expect, beforeAll, afterAll } from "vitest";
import { crearApp } from "./solucion.js";

let servidor, url;
beforeAll(() => {
  servidor = crearApp().listen(0);
  url = `http://127.0.0.1:${servidor.address().port}`;
});
afterAll(() => servidor.close());

test("GET /productos devuelve los 3 productos", async () => {
  const r = await fetch(`${url}/productos`);
  expect(r.status).toBe(200);
  const productos = await r.json();
  expect(productos).toHaveLength(3);
  expect(productos[0]).toEqual({ id: 1, nombre: "Teclado", precio: 120 });
});

test("GET /productos/2 devuelve el Mouse", async () => {
  const r = await fetch(`${url}/productos/2`);
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ id: 2, nombre: "Mouse", precio: 45 });
});

test("GET /productos/3 devuelve el Monitor (no siempre el primero)", async () => {
  const r = await fetch(`${url}/productos/3`);
  expect(await r.json()).toEqual({ id: 3, nombre: "Monitor", precio: 650 });
});

test("un id que no existe responde 404", async () => {
  const r = await fetch(`${url}/productos/99`);
  expect(r.status).toBe(404);
});

test("el 404 trae { error: \"Producto no encontrado\" } en JSON", async () => {
  const r = await fetch(`${url}/productos/99`);
  expect(await r.json()).toEqual({ error: "Producto no encontrado" });
});

test("un id que no es número (/productos/abc) también da 404 con el mensaje", async () => {
  const r = await fetch(`${url}/productos/abc`);
  expect(r.status).toBe(404);
  expect(await r.json()).toEqual({ error: "Producto no encontrado" });
});
