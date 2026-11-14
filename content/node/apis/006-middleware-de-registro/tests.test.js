import { test, expect, beforeEach, afterEach } from "vitest";
import { crearApp } from "./solucion.js";

// Cada test con su propio registro vacío y su propia app.
let servidor, url, registro;
beforeEach(() => {
  registro = [];
  servidor = crearApp(registro).listen(0);
  url = `http://127.0.0.1:${servidor.address().port}`;
});
afterEach(() => servidor.close());

test("las rutas siguen funcionando: GET /saludo responde 200 con el mensaje", async () => {
  const r = await fetch(`${url}/saludo`);
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ mensaje: "Hola" });
});

test("una petición queda registrada como { metodo, ruta }", async () => {
  await fetch(`${url}/saludo`);
  expect(registro).toEqual([{ metodo: "GET", ruta: "/saludo" }]);
});

test("registra varias peticiones en el orden en que llegan", async () => {
  await fetch(`${url}/saludo`);
  await fetch(`${url}/productos`);
  await fetch(`${url}/saludo`, { method: "DELETE" });
  expect(registro).toEqual([
    { metodo: "GET", ruta: "/saludo" },
    { metodo: "GET", ruta: "/productos" },
    { metodo: "DELETE", ruta: "/saludo" },
  ]);
});

test("también registra las rutas que no existen (404)", async () => {
  const r = await fetch(`${url}/no-existe`);
  expect(r.status).toBe(404);
  expect(registro).toEqual([{ metodo: "GET", ruta: "/no-existe" }]);
});

test("la ruta se registra sin la query string", async () => {
  await fetch(`${url}/productos?orden=precio&pagina=2`);
  expect(registro).toEqual([{ metodo: "GET", ruta: "/productos" }]);
});

test("la respuesta trae el header X-Api-Version: 1", async () => {
  const r = await fetch(`${url}/productos`);
  expect(r.headers.get("x-api-version")).toBe("1");
  expect(await r.json()).toEqual([{ id: 1, nombre: "Teclado" }]);
});

test("el header X-Api-Version también va en las respuestas 404", async () => {
  const r = await fetch(`${url}/no-existe`);
  expect(r.headers.get("x-api-version")).toBe("1");
});
