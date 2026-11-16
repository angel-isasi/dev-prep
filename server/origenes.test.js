import { afterAll, beforeAll, describe, expect, test } from "vitest";
import express from "express";
import { controlDeOrigen, origenPermitido } from "./origenes.js";

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
