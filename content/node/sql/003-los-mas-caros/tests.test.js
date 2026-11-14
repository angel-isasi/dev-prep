import { test, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { masCaros, paginaDeProductos } from "./solucion.js";

// Cada test recibe una base nueva en memoria, con las mismas tablas y datos.
function crearBase() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE productos (
      id INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      precio REAL NOT NULL,
      stock INTEGER NOT NULL
    );
    INSERT INTO productos (id, nombre, categoria, precio, stock) VALUES
      (1, 'Teclado mecánico', 'perifericos', 189, 15),
      (2, 'Mouse inalámbrico', 'perifericos', 59, 40),
      (3, 'Monitor 24 pulgadas', 'monitores', 649, 8),
      (4, 'Laptop 14 pulgadas', 'computadoras', 2899, 5),
      (5, 'Audífonos con micrófono', 'audio', 129, 0),
      (6, 'Parlante bluetooth', 'audio', 99, 22),
      (7, 'Webcam HD', 'perifericos', 149, 12),
      (8, 'Monitor 27 pulgadas', 'monitores', 999, 3);
  `);
  return db;
}

let db;
beforeEach(() => {
  db = crearBase();
});

test("masCaros(db, 3) trae los 3 más caros, del más caro al más barato", () => {
  expect(masCaros(db, 3)).toEqual([
    { nombre: "Laptop 14 pulgadas", precio: 2899 },
    { nombre: "Monitor 27 pulgadas", precio: 999 },
    { nombre: "Monitor 24 pulgadas", precio: 649 },
  ]);
});

test("masCaros(db, 1) trae solo el más caro y masCaros(db, 0) no trae nada", () => {
  expect(masCaros(db, 1)).toEqual([{ nombre: "Laptop 14 pulgadas", precio: 2899 }]);
  expect(masCaros(db, 0)).toEqual([]);
});

test("si n es mayor que la cantidad de productos, trae todos", () => {
  const filas = masCaros(db, 20);
  expect(filas).toHaveLength(8);
  expect(filas[7]).toEqual({ nombre: "Mouse inalámbrico", precio: 59 });
});

test("en un empate de precio, desempata por nombre de la A a la Z", () => {
  db.prepare("INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)").run(
    "Impresora láser",
    "computadoras",
    999,
    4,
  );
  expect(masCaros(db, 3).map((p) => p.nombre)).toEqual([
    "Laptop 14 pulgadas",
    "Impresora láser",
    "Monitor 27 pulgadas",
  ]);
});

test("paginaDeProductos: la página 1 son los primeros por id", () => {
  expect(paginaDeProductos(db, 1, 3)).toEqual([
    { id: 1, nombre: "Teclado mecánico" },
    { id: 2, nombre: "Mouse inalámbrico" },
    { id: 3, nombre: "Monitor 24 pulgadas" },
  ]);
});

test("paginaDeProductos: las páginas siguientes saltan las anteriores", () => {
  expect(paginaDeProductos(db, 2, 3).map((p) => p.id)).toEqual([4, 5, 6]);
  expect(paginaDeProductos(db, 3, 3).map((p) => p.id)).toEqual([7, 8]);
  expect(paginaDeProductos(db, 2, 5).map((p) => p.id)).toEqual([6, 7, 8]);
});

test("una página sin productos devuelve un arreglo vacío", () => {
  expect(paginaDeProductos(db, 4, 3)).toEqual([]);
});
