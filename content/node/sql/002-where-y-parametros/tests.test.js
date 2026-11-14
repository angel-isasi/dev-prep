import { test, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { productosDeCategoria, productosEnRango, buscarProductos, clientesDeCiudades } from "./solucion.js";

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

test("productosDeCategoria trae solo los de esa categoría, del más barato al más caro", () => {
  expect(productosDeCategoria(db, "perifericos")).toEqual([
    { id: 2, nombre: "Mouse inalámbrico", precio: 59 },
    { id: 7, nombre: "Webcam HD", precio: 149 },
    { id: 1, nombre: "Teclado mecánico", precio: 189 },
  ]);
  expect(productosDeCategoria(db, "audio")).toEqual([
    { id: 6, nombre: "Parlante bluetooth", precio: 99 },
    { id: 5, nombre: "Audífonos con micrófono", precio: 129 },
  ]);
});

test("una categoría que no existe devuelve un arreglo vacío", () => {
  expect(productosDeCategoria(db, "juguetes")).toEqual([]);
});

test("productosEnRango incluye los dos extremos (AND)", () => {
  expect(productosEnRango(db, 99, 149)).toEqual([
    { nombre: "Parlante bluetooth", precio: 99 },
    { nombre: "Audífonos con micrófono", precio: 129 },
    { nombre: "Webcam HD", precio: 149 },
  ]);
  expect(productosEnRango(db, 600, 1000).map((p) => p.nombre)).toEqual(["Monitor 24 pulgadas", "Monitor 27 pulgadas"]);
});

test("buscarProductos encuentra el texto en cualquier parte del nombre (LIKE)", () => {
  expect(buscarProductos(db, "monitor")).toEqual([
    { id: 3, nombre: "Monitor 24 pulgadas" },
    { id: 8, nombre: "Monitor 27 pulgadas" },
  ]);
  expect(buscarProductos(db, "pulgadas").map((p) => p.id)).toEqual([4, 3, 8]);
  expect(buscarProductos(db, "zzz")).toEqual([]);
});

test("clientesDeCiudades trae los de cualquiera de las dos ciudades (OR)", () => {
  expect(clientesDeCiudades(db, "Cusco", "Trujillo")).toEqual([
    { nombre: "Carla Huamán", ciudad: "Trujillo" },
    { nombre: "Luis Quispe", ciudad: "Cusco" },
  ]);
  expect(clientesDeCiudades(db, "Lima", "Piura").map((c) => c.nombre)).toEqual([
    "Ana Torres",
    "Diego Flores",
    "Jorge Mendoza",
  ]);
});

test("un intento de inyección SQL no trae nada (usas parámetros ?)", () => {
  expect(productosDeCategoria(db, "x' OR '1'='1")).toEqual([]);
  expect(clientesDeCiudades(db, "x' OR '1'='1", "y")).toEqual([]);
});

test("un texto con apóstrofo no rompe la consulta", () => {
  expect(() => buscarProductos(db, "O'Higgins")).not.toThrow();
  expect(buscarProductos(db, "O'Higgins")).toEqual([]);
});
