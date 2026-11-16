import { afterAll, beforeAll, expect, test } from "vitest";
import { crearApp } from "./app.js";

let servidor;
let base;
beforeAll(async () => {
  servidor = crearApp({ indice: { ejercicios: [], porId: new Map() } }).listen(0, "127.0.0.1");
  await new Promise((r) => servidor.once("listening", r));
  base = `http://127.0.0.1:${servidor.address().port}`;
});
afterAll(() => servidor?.close());

test("la app local no se deja meter en un marco ni adivinar tipos", async () => {
  const r = await fetch(`${base}/api/hola`);
  expect(r.headers.get("x-frame-options")).toBe("DENY");
  expect(r.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
  expect(r.headers.get("x-content-type-options")).toBe("nosniff");
  expect(r.headers.get("x-powered-by")).toBeNull();
});
