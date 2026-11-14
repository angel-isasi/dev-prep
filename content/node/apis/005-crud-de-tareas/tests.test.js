import { test, expect, beforeEach, afterEach } from "vitest";
import { crearApp } from "./solucion.js";

// Una app nueva por test: cada uno empieza con las 2 tareas iniciales.
let servidor, url;
beforeEach(() => {
  servidor = crearApp().listen(0);
  url = `http://127.0.0.1:${servidor.address().port}`;
});
afterEach(() => servidor.close());

/** fetch con cuerpo JSON. */
function enviar(metodo, ruta, datos) {
  return fetch(`${url}${ruta}`, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
}

test("GET /tareas devuelve las 2 tareas iniciales", async () => {
  const r = await fetch(`${url}/tareas`);
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual([
    { id: 1, titulo: "Estudiar Express", hecha: false },
    { id: 2, titulo: "Practicar SQL", hecha: true },
  ]);
});

test("GET /tareas/:id devuelve una tarea, y 404 si no existe", async () => {
  const r1 = await fetch(`${url}/tareas/2`);
  expect(await r1.json()).toEqual({ id: 2, titulo: "Practicar SQL", hecha: true });

  const r2 = await fetch(`${url}/tareas/99`);
  expect(r2.status).toBe(404);
  expect(await r2.json()).toEqual({ error: "Tarea no encontrada" });
});

test("POST /tareas crea con id 3 y hecha: false (201), y luego se puede leer", async () => {
  const r = await enviar("POST", "/tareas", { titulo: "  Leer sobre REST " });
  expect(r.status).toBe(201);
  expect(await r.json()).toEqual({ id: 3, titulo: "Leer sobre REST", hecha: false });

  const r2 = await fetch(`${url}/tareas/3`);
  expect(r2.status).toBe(200);
});

test("POST /tareas sin título válido responde 400", async () => {
  const r = await enviar("POST", "/tareas", { titulo: "  " });
  expect(r.status).toBe(400);
  expect(await r.json()).toEqual({ error: "El título es obligatorio" });
});

test("PUT /tareas/1 reemplaza título y hecha (200) y el cambio queda guardado", async () => {
  const r = await enviar("PUT", "/tareas/1", { titulo: "Estudiar Express 5", hecha: true });
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ id: 1, titulo: "Estudiar Express 5", hecha: true });

  const r2 = await fetch(`${url}/tareas/1`);
  expect(await r2.json()).toEqual({ id: 1, titulo: "Estudiar Express 5", hecha: true });
});

test("PUT con datos inválidos da 400, y a un id que no existe da 404", async () => {
  const r1 = await enviar("PUT", "/tareas/1", { titulo: "Algo", hecha: "si" });
  expect(r1.status).toBe(400);
  expect(await r1.json()).toEqual({ error: "Envía titulo (texto) y hecha (true o false)" });

  const r2 = await enviar("PUT", "/tareas/99", { titulo: "Algo", hecha: true });
  expect(r2.status).toBe(404);
});

test("DELETE /tareas/2 responde 204 sin cuerpo y la tarea desaparece", async () => {
  const r = await fetch(`${url}/tareas/2`, { method: "DELETE" });
  expect(r.status).toBe(204);
  expect(await r.text()).toBe("");

  expect((await fetch(`${url}/tareas/2`)).status).toBe(404);
  expect(await (await fetch(`${url}/tareas`)).json()).toHaveLength(1);

  const otraVez = await fetch(`${url}/tareas/2`, { method: "DELETE" });
  expect(otraVez.status).toBe(404);
});

test("cada crearApp() tiene sus propios datos", async () => {
  await enviar("POST", "/tareas", { titulo: "Solo en la primera app" });

  const otro = crearApp().listen(0);
  try {
    const r = await fetch(`http://127.0.0.1:${otro.address().port}/tareas`);
    expect(await r.json()).toHaveLength(2);
  } finally {
    otro.close();
  }
});
