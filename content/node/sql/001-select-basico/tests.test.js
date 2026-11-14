import { test, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { listarProductos, listarClientes } from "./solucion.js";

// Cada test recibe una base nueva en memoria, con las mismas tablas y datos.
function crearBase() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE clientes (
      id INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      ciudad TEXT NOT NULL
    );
    CREATE TABLE productos (
      id INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      precio REAL NOT NULL,
      stock INTEGER NOT NULL
    );
    INSERT INTO clientes (id, nombre, email, ciudad) VALUES
      (1, 'Ana Torres', 'ana.torres@correo.pe', 'Lima'),
      (2, 'Luis Quispe', 'luis.quispe@correo.pe', 'Cusco'),
      (3, 'María Rojas', 'maria.rojas@correo.pe', 'Arequipa'),
      (4, 'Jorge Mendoza', 'jorge.mendoza@correo.pe', 'Lima'),
      (5, 'Carla Huamán', 'carla.huaman@correo.pe', 'Trujillo'),
      (6, 'Diego Flores', 'diego.flores@correo.pe', 'Lima');
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

test("listarProductos devuelve los 8 productos", () => {
  const filas = listarProductos(db);
  expect(Array.isArray(filas)).toBe(true);
  expect(filas).toHaveLength(8);
});

test("cada producto trae solo nombre y precio (nada de SELECT *)", () => {
  for (const fila of listarProductos(db)) {
    expect(Object.keys(fila).sort()).toEqual(["nombre", "precio"]);
  }
});

test("los productos van del más barato al más caro", () => {
  expect(listarProductos(db)).toEqual([
    { nombre: "Mouse inalámbrico", precio: 59 },
    { nombre: "Parlante bluetooth", precio: 99 },
    { nombre: "Audífonos con micrófono", precio: 129 },
    { nombre: "Webcam HD", precio: 149 },
    { nombre: "Teclado mecánico", precio: 189 },
    { nombre: "Monitor 24 pulgadas", precio: 649 },
    { nombre: "Monitor 27 pulgadas", precio: 999 },
    { nombre: "Laptop 14 pulgadas", precio: 2899 },
  ]);
});

test("listarClientes trae solo nombre y ciudad de los 6 clientes", () => {
  const filas = listarClientes(db);
  expect(filas).toHaveLength(6);
  expect(filas).toContainEqual({ nombre: "Luis Quispe", ciudad: "Cusco" });
  for (const fila of filas) {
    expect(Object.keys(fila).sort()).toEqual(["ciudad", "nombre"]);
  }
});

test("los clientes van ordenados por nombre de la A a la Z", () => {
  expect(listarClientes(db).map((c) => c.nombre)).toEqual([
    "Ana Torres",
    "Carla Huamán",
    "Diego Flores",
    "Jorge Mendoza",
    "Luis Quispe",
    "María Rojas",
  ]);
});

test("la consulta lee la tabla en ese momento: un producto nuevo también aparece", () => {
  db.prepare("INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)").run(
    "Pad para mouse",
    "perifericos",
    25,
    30,
  );
  const filas = listarProductos(db);
  expect(filas).toHaveLength(9);
  expect(filas[0]).toEqual({ nombre: "Pad para mouse", precio: 25 });
});
