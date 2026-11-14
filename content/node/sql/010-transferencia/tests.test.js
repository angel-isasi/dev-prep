import { test, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { transferir } from "./solucion.js";

// Cada test recibe una base nueva en memoria, con las mismas tablas y datos.
function crearBase() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE clientes (
      id INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL
    );
    CREATE TABLE billeteras (
      cliente_id INTEGER PRIMARY KEY REFERENCES clientes(id),
      saldo INTEGER NOT NULL CHECK (saldo >= 0 AND saldo <= 5000)
    );
    INSERT INTO clientes (id, nombre) VALUES
      (1, 'Ana Torres'),
      (2, 'Luis Quispe'),
      (3, 'María Rojas'),
      (4, 'Jorge Mendoza'),
      (5, 'Carla Huamán'),
      (6, 'Diego Flores');
    INSERT INTO billeteras (cliente_id, saldo) VALUES
      (1, 1200),
      (2, 300),
      (3, 4900),
      (4, 0);
  `);
  return db;
}

const saldo = (db, id) => db.prepare("SELECT saldo FROM billeteras WHERE cliente_id = ?").get(id)?.saldo;
const todosLosSaldos = (db) => db.prepare("SELECT cliente_id, saldo FROM billeteras ORDER BY cliente_id").all();

let db;
beforeEach(() => {
  db = crearBase();
});

test("transfiere: resta al origen y suma al destino", () => {
  transferir(db, 1, 2, 200);
  expect(saldo(db, 1)).toBe(1000);
  expect(saldo(db, 2)).toBe(500);
  expect(saldo(db, 3)).toBe(4900);
});

test("se puede transferir todo el saldo", () => {
  transferir(db, 1, 4, 1200);
  expect(saldo(db, 1)).toBe(0);
  expect(saldo(db, 4)).toBe(1200);
});

test("con saldo insuficiente lanza error y nadie cambia", () => {
  const antes = todosLosSaldos(db);
  expect(() => transferir(db, 2, 1, 500)).toThrow("Saldo insuficiente");
  expect(() => transferir(db, 5, 1, 100)).toThrow("La billetera de origen no existe");
  expect(todosLosSaldos(db)).toEqual(antes);
});

test("si el destino no existe, el origen NO pierde su dinero (ROLLBACK)", () => {
  expect(() => transferir(db, 1, 99, 200)).toThrow("La billetera de destino no existe");
  expect(saldo(db, 1)).toBe(1200);
});

test("si la base rechaza la suma por el tope de 5000, se deshace también la resta", () => {
  expect(() => transferir(db, 1, 3, 200)).toThrow();
  expect(saldo(db, 1)).toBe(1200);
  expect(saldo(db, 3)).toBe(4900);
});

test("valida el monto y que origen y destino sean distintos", () => {
  const antes = todosLosSaldos(db);
  expect(() => transferir(db, 1, 2, 0)).toThrow("El monto debe ser mayor que cero");
  expect(() => transferir(db, 1, 2, -50)).toThrow("El monto debe ser mayor que cero");
  expect(() => transferir(db, 1, 1, 50)).toThrow("El origen y el destino deben ser distintos");
  expect(todosLosSaldos(db)).toEqual(antes);
});

test("después de un error no queda una transacción abierta y la siguiente transferencia funciona", () => {
  expect(() => transferir(db, 1, 99, 200)).toThrow();
  expect(db.isTransaction).toBe(false);
  transferir(db, 1, 2, 100);
  expect(db.isTransaction).toBe(false);
  expect(saldo(db, 1)).toBe(1100);
  expect(saldo(db, 2)).toBe(400);
});
