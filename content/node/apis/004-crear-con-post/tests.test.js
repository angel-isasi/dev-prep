import { test, expect, beforeEach, afterEach } from "vitest";
import { crearApp } from "./solucion.js";

// Una app nueva por test: así lo que crea un test no afecta al siguiente.
let servidor, url;
beforeEach(() => {
  servidor = crearApp().listen(0);
  url = `http://127.0.0.1:${servidor.address().port}`;
});
afterEach(() => servidor.close());

/** Envía un POST con cuerpo JSON. */
function crear(datos) {
  return fetch(`${url}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
}

test("un POST válido responde 201 con el usuario creado", async () => {
  const r = await crear({ nombre: "Beto", email: "beto@correo.com" });
  expect(r.status).toBe(201);
  expect(await r.json()).toEqual({ id: 2, nombre: "Beto", email: "beto@correo.com" });
});

test("la respuesta 201 trae el header Location: /usuarios/2", async () => {
  const r = await crear({ nombre: "Beto", email: "beto@correo.com" });
  expect(r.headers.get("location")).toBe("/usuarios/2");
});

test("después del POST, GET /usuarios incluye al nuevo usuario", async () => {
  await crear({ nombre: "Beto", email: "beto@correo.com" });
  const r = await fetch(`${url}/usuarios`);
  expect(r.status).toBe(200);
  expect((await r.json()).map((u) => u.nombre)).toEqual(["Ana", "Beto"]);
});

test("sin nombre (o solo espacios) responde 400 con el error del nombre", async () => {
  const r1 = await crear({ email: "x@correo.com" });
  expect(r1.status).toBe(400);
  expect(await r1.json()).toEqual({ error: "El nombre es obligatorio" });

  const r2 = await crear({ nombre: "   ", email: "x@correo.com" });
  expect(r2.status).toBe(400);
});

test("un email sin @ responde 400 con el error del email", async () => {
  const r = await crear({ nombre: "Carla", email: "carla.correo.com" });
  expect(r.status).toBe(400);
  expect(await r.json()).toEqual({ error: "El email no es válido" });
});

test("una petición sin cuerpo responde 400, no 500", async () => {
  const r = await fetch(`${url}/usuarios`, { method: "POST" });
  expect(r.status).toBe(400);
  expect(await r.json()).toEqual({ error: "El nombre es obligatorio" });
});

test("recorta el nombre e ignora campos extra como rol", async () => {
  const r = await crear({ nombre: "  Beto ", email: "beto@correo.com", rol: "admin" });
  expect(await r.json()).toEqual({ id: 2, nombre: "Beto", email: "beto@correo.com" });
});

test("un POST inválido no guarda nada", async () => {
  await crear({ nombre: "Carla", email: "sin-arroba" });
  const r = await fetch(`${url}/usuarios`);
  expect(await r.json()).toHaveLength(1);
});
