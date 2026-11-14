import { test, expect, beforeAll, afterAll } from "vitest";
import { crearApp } from "./solucion.js";

let servidor, url;
beforeAll(() => {
  servidor = crearApp().listen(0);
  url = `http://127.0.0.1:${servidor.address().port}`;
});
afterAll(() => servidor.close());

test("GET /productos/1 responde 200 con el producto", async () => {
  const r = await fetch(`${url}/productos/1`);
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ id: 1, nombre: "Teclado", precio: 120 });
});

test("un producto que no existe responde 404 con su mensaje", async () => {
  const r = await fetch(`${url}/productos/99`);
  expect(r.status).toBe(404);
  expect(await r.json()).toEqual({ error: "Producto no encontrado" });
});

test("un id inválido (abc, 0, 1.5) responde 400 con su mensaje", async () => {
  for (const id of ["abc", "0", "1.5"]) {
    const r = await fetch(`${url}/productos/${id}`);
    expect(r.status).toBe(400);
    expect(await r.json()).toEqual({ error: "El id debe ser un número entero positivo" });
  }
});

test("un error en un handler async termina en 500 con JSON genérico", async () => {
  const r = await fetch(`${url}/reporte`);
  expect(r.status).toBe(500);
  expect(r.headers.get("content-type")).toContain("application/json");
  expect(await r.json()).toEqual({ error: "Error interno del servidor" });
});

test("el 500 no filtra detalles del error real (ni clave ni conexión)", async () => {
  const r = await fetch(`${url}/reporte`);
  const texto = await r.text();
  expect(texto).not.toContain("clave123");
  expect(texto).not.toContain("postgres");
});

test("una ruta que no existe responde 404 en JSON", async () => {
  const r = await fetch(`${url}/usuarios`);
  expect(r.status).toBe(404);
  expect(r.headers.get("content-type")).toContain("application/json");
  expect(await r.json()).toEqual({ error: "Ruta no encontrada" });
});

test("después de un error, la API sigue funcionando", async () => {
  await fetch(`${url}/reporte`);
  const r = await fetch(`${url}/productos/2`);
  expect(r.status).toBe(200);
  expect((await r.json()).nombre).toBe("Mouse");
});
