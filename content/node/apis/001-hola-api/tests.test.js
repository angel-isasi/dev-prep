import { test, expect, beforeAll, afterAll } from "vitest";
import { crearApp } from "./solucion.js";

let servidor, url;
beforeAll(() => {
  // listen(0) = "dame cualquier puerto libre". Así los tests no chocan con otros programas.
  servidor = crearApp().listen(0);
  url = `http://127.0.0.1:${servidor.address().port}`;
});
afterAll(() => servidor.close());

test("GET /hola responde con código 200", async () => {
  const r = await fetch(`${url}/hola`);
  expect(r.status).toBe(200);
});

test("GET /hola devuelve { mensaje: \"Hola, mundo\" }", async () => {
  const r = await fetch(`${url}/hola`);
  expect(await r.json()).toEqual({ mensaje: "Hola, mundo" });
});

test("la respuesta trae el header Content-Type: application/json", async () => {
  const r = await fetch(`${url}/hola`);
  expect(r.headers.get("content-type")).toContain("application/json");
});

test("GET /estado devuelve { ok: true, version: \"1.0.0\" }", async () => {
  const r = await fetch(`${url}/estado`);
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ ok: true, version: "1.0.0" });
});

test("una ruta que no existe responde 404", async () => {
  const r = await fetch(`${url}/no-existe`);
  expect(r.status).toBe(404);
});

test("el método también cuenta: POST /hola no está definido (404)", async () => {
  const r = await fetch(`${url}/hola`, { method: "POST" });
  expect(r.status).toBe(404);
});
