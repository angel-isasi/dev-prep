import { test, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { pedidosConCliente, pedidosDeCiudad } from "./solucion.js";

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

test("pedidosConCliente devuelve los 9 pedidos ordenados por id", () => {
  const filas = pedidosConCliente(db);
  expect(filas).toHaveLength(9);
  expect(filas.map((p) => p.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test("cada pedido trae exactamente id, fecha, cliente, producto, cantidad y total", () => {
  for (const fila of pedidosConCliente(db)) {
    expect(Object.keys(fila).sort()).toEqual(["cantidad", "cliente", "fecha", "id", "producto", "total"]);
  }
});

test("el pedido trae los NOMBRES del cliente y del producto, no sus ids", () => {
  expect(pedidosConCliente(db)[0]).toEqual({
    id: 1,
    fecha: "2026-10-02",
    cliente: "Ana Torres",
    producto: "Teclado mecánico",
    cantidad: 1,
    total: 189,
  });
  expect(pedidosConCliente(db)[3]).toMatchObject({ id: 4, cliente: "María Rojas", producto: "Monitor 24 pulgadas" });
});

test("el total es cantidad por precio del producto", () => {
  const filas = pedidosConCliente(db);
  expect(filas[1]).toMatchObject({ id: 2, cantidad: 2, total: 118 });
  expect(filas[3]).toMatchObject({ id: 4, cantidad: 2, total: 1298 });
  expect(filas[4]).toMatchObject({ id: 5, cantidad: 3, total: 297 });
});

test("pedidosDeCiudad trae solo los pedidos de clientes de esa ciudad", () => {
  expect(pedidosDeCiudad(db, "Cusco")).toEqual([
    { id: 3, fecha: "2026-10-05", cliente: "Luis Quispe", producto: "Laptop 14 pulgadas", cantidad: 1, total: 2899 },
    { id: 6, fecha: "2026-10-12", cliente: "Luis Quispe", producto: "Mouse inalámbrico", cantidad: 1, total: 59 },
  ]);
  expect(pedidosDeCiudad(db, "Lima").map((p) => p.id)).toEqual([1, 2, 5, 8, 9]);
});

test("una ciudad sin pedidos devuelve []", () => {
  expect(pedidosDeCiudad(db, "Piura")).toEqual([]);
  expect(pedidosDeCiudad(db, "Trujillo")).toEqual([]);
});

test("la ciudad entra como parámetro: un intento de inyección no trae nada", () => {
  expect(pedidosDeCiudad(db, "x' OR '1'='1")).toEqual([]);
});
