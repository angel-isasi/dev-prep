import { test, expect } from "vitest";
import { guardarSeguro } from "./solucion.js";

// Simulan la API: una responde bien después de un momento, la otra falla.
const guardarBien = (datos) =>
  new Promise((resolver) => setTimeout(() => resolver({ ok: true, id: 7, ...datos }), 10));
const guardarSinInternet = () =>
  new Promise((_, rechazar) => setTimeout(() => rechazar(new Error("Sin conexión")), 10));

test("si guardar falla, no lanza: devuelve el mensaje del error", async () => {
  await expect(guardarSeguro(guardarSinInternet, {})).resolves.toEqual({
    ok: false,
    mensaje: "Sin conexión",
  });
});

test("si guardar sale bien, devuelve su respuesta", async () => {
  expect(await guardarSeguro(guardarBien, { nombre: "Ana" })).toEqual({ ok: true, id: 7, nombre: "Ana" });
});

test("también atrapa un error que se lanza al instante", async () => {
  const guardarRoto = () => {
    throw new Error("Datos inválidos");
  };
  expect(await guardarSeguro(guardarRoto, {})).toEqual({ ok: false, mensaje: "Datos inválidos" });
});
