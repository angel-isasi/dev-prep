import { afterAll, beforeAll, describe, expect, test } from "vitest";
import express from "express";
import http from "node:http";
import { controlDeOrigen, hostPermitido, origenPermitido } from "./origenes.js";

/** Petición con una cabecera Host a elección (fetch no deja cambiarla). */
const pedirConHost = (host) =>
  new Promise((resolver, rechazar) => {
    const url = new URL(`${base}/api/abrir`);
    const req = http.request({ hostname: url.hostname, port: url.port, path: url.pathname, method: "POST", headers: { Host: host } }, (r) => {
      r.resume();
      resolver(r.statusCode);
    });
    req.on("error", rechazar);
    req.end();
  });

let servidor;
let base;
beforeAll(async () => {
  const app = express();
  app.use("/api", controlDeOrigen);
  app.post("/api/abrir", (req, res) => res.json({ ok: true }));
  servidor = app.listen(0, "127.0.0.1");
  await new Promise((r) => servidor.once("listening", r));
  base = `http://127.0.0.1:${servidor.address().port}`;
});
afterAll(() => servidor?.close());

describe("origenes", () => {
  test("acepta la app local, Vite y la versión web; rechaza otras páginas", () => {
    expect(origenPermitido(undefined)).toBe(true);
    expect(origenPermitido("http://localhost:4321")).toBe(true);
    expect(origenPermitido("http://127.0.0.1:5173")).toBe(true);
    expect(origenPermitido("https://dev-prep.angel-isasi.com")).toBe(true);
    expect(origenPermitido("https://otra-pagina.com")).toBe(false);
    expect(origenPermitido("http://localhost.otra.com")).toBe(false);
    expect(origenPermitido("https://dev-prep.angel-isasi.com.otra.com")).toBe(false);
  });

  test("solo acepta los nombres locales en la cabecera Host", () => {
    expect(hostPermitido("localhost:4321")).toBe(true);
    expect(hostPermitido("127.0.0.1:5173")).toBe(true);
    expect(hostPermitido("localhost")).toBe(true);
    expect(hostPermitido("atacante.com")).toBe(false);
    expect(hostPermitido("localhost.atacante.com:4321")).toBe(false);
    expect(hostPermitido(undefined)).toBe(false);
  });

  test("DNS rebinding: un dominio ajeno que apunta a tu laptop recibe 403", async () => {
    expect(await pedirConHost("atacante.com:4321")).toBe(403);
    expect(await pedirConHost(`127.0.0.1:${new URL(base).port}`)).toBe(200);
  });

  test("una web ajena no puede ejecutar acciones", async () => {
    const r = await fetch(`${base}/api/abrir`, { method: "POST", headers: { Origin: "https://otra-pagina.com" } });
    expect(r.status).toBe(403);
  });

  test("la versión web recibe CORS y el permiso de red local", async () => {
    const pre = await fetch(`${base}/api/abrir`, {
      method: "OPTIONS",
      headers: { Origin: "https://dev-prep.angel-isasi.com", "Access-Control-Request-Private-Network": "true" },
    });
    expect(pre.status).toBe(204);
    expect(pre.headers.get("access-control-allow-origin")).toBe("https://dev-prep.angel-isasi.com");
    expect(pre.headers.get("access-control-allow-private-network")).toBe("true");
    const r = await fetch(`${base}/api/abrir`, { method: "POST", headers: { Origin: "https://dev-prep.angel-isasi.com" } });
    expect((await r.json()).ok).toBe(true);
  });
});
