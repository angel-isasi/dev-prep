import { test, expect, beforeAll, afterAll } from "vitest";
import { crearApp } from "./solucion.js";

let servidor, url;
beforeAll(() => {
  servidor = crearApp().listen(0);
  url = `http://127.0.0.1:${servidor.address().port}`;
});
afterAll(() => servidor.close());

/** GET con el header Authorization que le pases (o sin él). */
function pedir(ruta, authorization) {
  const headers = authorization ? { Authorization: authorization } : {};
  return fetch(`${url}${ruta}`, { headers });
}

test("GET /publico responde 200 sin token", async () => {
  const r = await pedir("/publico");
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ mensaje: "Esto lo ve cualquiera" });
});

test("GET /perfil sin header Authorization responde 401 \"Falta el token\"", async () => {
  const r = await pedir("/perfil");
  expect(r.status).toBe(401);
  expect(await r.json()).toEqual({ error: "Falta el token" });
});

test("un header sin el esquema Bearer responde 401 de formato", async () => {
  for (const valor of ["token-ana-123", "Basic token-ana-123"]) {
    const r = await pedir("/perfil", valor);
    expect(r.status).toBe(401);
    expect(await r.json()).toEqual({ error: "Formato inválido: usa Bearer <token>" });
  }
});

test("un token que no existe responde 401 \"Token inválido\"", async () => {
  const r = await pedir("/perfil", "Bearer token-falso");
  expect(r.status).toBe(401);
  expect(await r.json()).toEqual({ error: "Token inválido" });
});

test("con un token válido, GET /perfil devuelve quién eres", async () => {
  const r = await pedir("/perfil", "Bearer token-beto-456");
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ nombre: "Beto", rol: "usuario" });
});

test("un usuario sin rol admin en /admin/usuarios recibe 403, no 401", async () => {
  const r = await pedir("/admin/usuarios", "Bearer token-beto-456");
  expect(r.status).toBe(403);
  expect(await r.json()).toEqual({ error: "No tienes permiso" });
});

test("una admin entra a /admin/usuarios; sin token es 401", async () => {
  const r = await pedir("/admin/usuarios", "Bearer token-ana-123");
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ usuarios: ["Ana", "Beto"] });

  const sinToken = await pedir("/admin/usuarios");
  expect(sinToken.status).toBe(401);
});

test("las respuestas 401 traen el header WWW-Authenticate: Bearer", async () => {
  const r = await pedir("/perfil", "Bearer token-falso");
  expect(r.headers.get("www-authenticate")).toBe("Bearer");
});
