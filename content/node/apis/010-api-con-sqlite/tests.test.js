import { test, expect, beforeEach, afterEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { crearApp } from "./solucion.js";

// Cada test con su propia base en memoria (se crea de cero y desaparece al cerrar).
let db, servidor, url;
beforeEach(() => {
  db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE libros (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      autor  TEXT NOT NULL,
      anio   INTEGER NOT NULL
    );
    INSERT INTO libros (titulo, autor, anio) VALUES
      ('Cien años de soledad', 'Gabriel García Márquez', 1967),
      ('La ciudad y los perros', 'Mario Vargas Llosa', 1963),
      ('Conversación en La Catedral', 'Mario Vargas Llosa', 1969);
  `);
  servidor = crearApp(db).listen(0);
  url = `http://127.0.0.1:${servidor.address().port}`;
});
afterEach(() => {
  servidor.close();
  db.close();
});

/** POST /libros con cuerpo JSON. */
function crear(datos) {
  return fetch(`${url}/libros`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
}

/** Cuántas filas hay en la tabla (consultando la base directamente). */
const contar = () => db.prepare("SELECT COUNT(*) AS n FROM libros").get().n;

test("GET /libros devuelve los 3 libros de la base, ordenados por id", async () => {
  const r = await fetch(`${url}/libros`);
  expect(r.status).toBe(200);
  const libros = await r.json();
  expect(libros.map((l) => l.id)).toEqual([1, 2, 3]);
  expect(libros[0]).toEqual({ id: 1, titulo: "Cien años de soledad", autor: "Gabriel García Márquez", anio: 1967 });
});

test("?autor= filtra por autor exacto", async () => {
  const r = await fetch(`${url}/libros?autor=${encodeURIComponent("Mario Vargas Llosa")}`);
  expect((await r.json()).map((l) => l.titulo)).toEqual(["La ciudad y los perros", "Conversación en La Catedral"]);
});

test("un intento de inyección SQL en ?autor= no devuelve nada", async () => {
  const r = await fetch(`${url}/libros?autor=${encodeURIComponent("' OR '1'='1")}`);
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual([]);
});

test("GET /libros/:id devuelve el libro, y 404 si no existe", async () => {
  const r1 = await fetch(`${url}/libros/2`);
  expect(await r1.json()).toEqual({ id: 2, titulo: "La ciudad y los perros", autor: "Mario Vargas Llosa", anio: 1963 });

  const r2 = await fetch(`${url}/libros/99`);
  expect(r2.status).toBe(404);
  expect(await r2.json()).toEqual({ error: "Libro no encontrado" });
});

test("POST /libros inserta en la base y responde 201 con el id asignado", async () => {
  const r = await crear({ titulo: "Rayuela", autor: "Julio Cortázar", anio: 1963 });
  expect(r.status).toBe(201);
  expect(await r.json()).toEqual({ id: 4, titulo: "Rayuela", autor: "Julio Cortázar", anio: 1963 });

  const fila = db.prepare("SELECT titulo, autor FROM libros WHERE id = 4").get();
  expect({ ...fila }).toEqual({ titulo: "Rayuela", autor: "Julio Cortázar" });
});

test("un título con comilla simple se guarda sin romper el SQL", async () => {
  const r = await crear({ titulo: "L'Étranger", autor: "Albert Camus", anio: 1942 });
  expect(r.status).toBe(201);
  const r2 = await fetch(`${url}/libros/4`);
  expect((await r2.json()).titulo).toBe("L'Étranger");
});

test("un POST inválido responde 400 y no inserta nada", async () => {
  for (const datos of [{ autor: "X", anio: 2000 }, { titulo: "X", autor: " ", anio: 2000 }, { titulo: "X", autor: "Y", anio: "2000" }]) {
    const r = await crear(datos);
    expect(r.status).toBe(400);
    expect(await r.json()).toEqual({ error: "Envía titulo, autor (texto) y anio (entero)" });
  }
  expect(contar()).toBe(3);
});
