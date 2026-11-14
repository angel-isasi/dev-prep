import { test, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { resumenProductos, resumenDeCategoria, contarPedidosDeCliente } from "./solucion.js";

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
    CREATE TABLE pedidos (
      id INTEGER PRIMARY KEY,
      cliente_id INTEGER NOT NULL REFERENCES clientes(id),
      producto_id INTEGER NOT NULL REFERENCES productos(id),
      cantidad INTEGER NOT NULL,
      fecha TEXT NOT NULL
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
    INSERT INTO pedidos (id, cliente_id, producto_id, cantidad, fecha) VALUES
      (1, 1, 1, 1, '2026-10-02'),
      (2, 1, 2, 2, '2026-10-02'),
      (3, 2, 4, 1, '2026-10-05'),
      (4, 3, 3, 2, '2026-10-07'),
      (5, 4, 6, 3, '2026-10-10'),
      (6, 2, 2, 1, '2026-10-12'),
      (7, 3, 7, 1, '2026-10-15'),
      (8, 1, 8, 1, '2026-10-20'),
      (9, 4, 1, 1, '2026-10-22');
  `);
  return db;
}

let db;
beforeEach(() => {
  db = crearBase();
});

test("resumenProductos devuelve un objeto (una fila), no un arreglo", () => {
  const resumen = resumenProductos(db);
  expect(Array.isArray(resumen)).toBe(false);
  expect(Object.keys(resumen).sort()).toEqual(["precioPromedio", "stockTotal", "total"]);
});

test("resumenProductos cuenta, suma el stock y promedia el precio", () => {
  expect(resumenProductos(db)).toEqual({ total: 8, stockTotal: 105, precioPromedio: 646.5 });
});

test("resumenDeCategoria filtra por categoría y redondea el promedio a 2 decimales", () => {
  expect(resumenDeCategoria(db, "perifericos")).toEqual({ total: 3, stockTotal: 67, precioPromedio: 132.33 });
  expect(resumenDeCategoria(db, "audio")).toEqual({ total: 2, stockTotal: 22, precioPromedio: 114 });
});

test("una categoría sin productos da todo en 0 (no null)", () => {
  expect(resumenDeCategoria(db, "juguetes")).toEqual({ total: 0, stockTotal: 0, precioPromedio: 0 });
});

test("contarPedidosDeCliente devuelve un número, no un objeto", () => {
  expect(typeof contarPedidosDeCliente(db, 1)).toBe("number");
  expect(contarPedidosDeCliente(db, 1)).toBe(3);
  expect(contarPedidosDeCliente(db, 2)).toBe(2);
});

test("un cliente sin pedidos tiene 0", () => {
  expect(contarPedidosDeCliente(db, 5)).toBe(0);
  expect(contarPedidosDeCliente(db, 99)).toBe(0);
});

test("las cifras se recalculan con los datos actuales", () => {
  db.prepare("INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)").run(
    "Micrófono USB",
    "audio",
    201,
    10,
  );
  expect(resumenDeCategoria(db, "audio")).toEqual({ total: 3, stockTotal: 32, precioPromedio: 143 });
  expect(resumenProductos(db).total).toBe(9);
});
