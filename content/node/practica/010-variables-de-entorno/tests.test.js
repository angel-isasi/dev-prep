import { test, expect, vi, afterEach } from "vitest";
import { leerConfig } from "./solucion.js";

afterEach(() => {
  vi.unstubAllEnvs(); // devuelve process.env a como estaba
});

test("sin variables usa los valores por defecto", () => {
  expect(leerConfig({})).toEqual({
    puerto: 3000,
    entorno: "development",
    debug: false,
    urlBaseDeDatos: "sqlite://local.db",
  });
});

test("convierte PORT de string a número", () => {
  const config = leerConfig({ PORT: "8080" });
  expect(config.puerto).toBe(8080);
  expect(typeof config.puerto).toBe("number");
});

test("un PORT inválido lanza un error que muestra el valor", () => {
  expect(() => leerConfig({ PORT: "abc" })).toThrow("PORT inválido: abc");
  expect(() => leerConfig({ PORT: "0" })).toThrow("PORT inválido");
  expect(() => leerConfig({ PORT: "70000" })).toThrow("PORT inválido");
  expect(() => leerConfig({ PORT: "80.5" })).toThrow("PORT inválido");
});

test("DEBUG es true solo con \"true\" o \"1\"", () => {
  expect(leerConfig({ DEBUG: "true" }).debug).toBe(true);
  expect(leerConfig({ DEBUG: "1" }).debug).toBe(true);
  expect(leerConfig({ DEBUG: "false" }).debug).toBe(false);
  expect(leerConfig({ DEBUG: "0" }).debug).toBe(false);
});

test("NODE_ENV acepta solo development, production o test", () => {
  expect(leerConfig({ NODE_ENV: "test" }).entorno).toBe("test");
  expect(() => leerConfig({ NODE_ENV: "produccion" })).toThrow("NODE_ENV inválido");
});

test("en producción DATABASE_URL es obligatoria", () => {
  expect(() => leerConfig({ NODE_ENV: "production" })).toThrow("Falta DATABASE_URL");
  expect(() => leerConfig({ NODE_ENV: "production", DATABASE_URL: "" })).toThrow("Falta DATABASE_URL");
  const config = leerConfig({ NODE_ENV: "production", DATABASE_URL: "postgres://db:5432/tienda", PORT: "80" });
  expect(config).toEqual({
    puerto: 80,
    entorno: "production",
    debug: false,
    urlBaseDeDatos: "postgres://db:5432/tienda",
  });
});

test("una variable vacía cuenta como si no existiera", () => {
  expect(leerConfig({ PORT: "", NODE_ENV: "" })).toMatchObject({ puerto: 3000, entorno: "development" });
});

test("si no le pasas nada, lee process.env", () => {
  vi.stubEnv("PORT", "4567");
  vi.stubEnv("NODE_ENV", "test");
  expect(leerConfig().puerto).toBe(4567);
});
