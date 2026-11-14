import { test, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { clientesSinPedidos, pedidosPorCliente } from "./solucion.js";

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

test("clientesSinPedidos trae a Carla y Diego, con id, nombre y email", () => {
  expect(clientesSinPedidos(db)).toEqual([
    { id: 5, nombre: "Carla Huamán", email: "carla.huaman@correo.pe" },
    { id: 6, nombre: "Diego Flores", email: "diego.flores@correo.pe" },
  ]);
});

test("un cliente recién registrado aparece como cliente sin pedidos", () => {
  db.prepare("INSERT INTO clientes (nombre, email, ciudad) VALUES (?, ?, ?)").run(
    "Rosa Paredes",
    "rosa.paredes@correo.pe",
    "Piura",
  );
  expect(clientesSinPedidos(db).map((c) => c.nombre)).toEqual(["Carla Huamán", "Diego Flores", "Rosa Paredes"]);
});

test("cuando un cliente hace su primer pedido, deja de aparecer", () => {
  db.prepare("INSERT INTO pedidos (cliente_id, producto_id, cantidad, fecha) VALUES (?, ?, ?, ?)").run(
    5,
    2,
    1,
    "2026-11-01",
  );
  expect(clientesSinPedidos(db).map((c) => c.nombre)).toEqual(["Diego Flores"]);
});

test("pedidosPorCliente incluye a TODOS los clientes, también a los de 0 pedidos", () => {
  const filas = pedidosPorCliente(db);
  expect(filas).toHaveLength(6);
  expect(filas).toContainEqual({ nombre: "Carla Huamán", pedidos: 0 });
  expect(filas).toContainEqual({ nombre: "Diego Flores", pedidos: 0 });
});

test("pedidosPorCliente cuenta bien y ordena de más a menos, con empate por nombre", () => {
  expect(pedidosPorCliente(db)).toEqual([
    { nombre: "Ana Torres", pedidos: 3 },
    { nombre: "Jorge Mendoza", pedidos: 2 },
    { nombre: "Luis Quispe", pedidos: 2 },
    { nombre: "María Rojas", pedidos: 2 },
    { nombre: "Carla Huamán", pedidos: 0 },
    { nombre: "Diego Flores", pedidos: 0 },
  ]);
});

test("la suma de los conteos es igual a la cantidad de pedidos (9)", () => {
  const suma = pedidosPorCliente(db).reduce((s, c) => s + c.pedidos, 0);
  expect(suma).toBe(9);
});
