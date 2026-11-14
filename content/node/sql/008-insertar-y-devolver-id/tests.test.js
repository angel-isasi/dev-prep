import { test, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { crearCliente } from "./solucion.js";

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
    INSERT INTO clientes (id, nombre, email, ciudad) VALUES
      (1, 'Ana Torres', 'ana.torres@correo.pe', 'Lima'),
      (2, 'Luis Quispe', 'luis.quispe@correo.pe', 'Cusco'),
      (3, 'María Rojas', 'maria.rojas@correo.pe', 'Arequipa'),
      (4, 'Jorge Mendoza', 'jorge.mendoza@correo.pe', 'Lima'),
      (5, 'Carla Huamán', 'carla.huaman@correo.pe', 'Trujillo'),
      (6, 'Diego Flores', 'diego.flores@correo.pe', 'Lima');
  `);
  return db;
}

const contarClientes = (db) => db.prepare("SELECT COUNT(*) AS n FROM clientes").get().n;
const buscarCliente = (db, id) => db.prepare("SELECT id, nombre, email, ciudad FROM clientes WHERE id = ?").get(id);

const ROSA = { nombre: "Rosa Paredes", email: "rosa.paredes@correo.pe", ciudad: "Piura" };

let db;
beforeEach(() => {
  db = crearBase();
});

test("devuelve el id nuevo como número", () => {
  const id = crearCliente(db, ROSA);
  expect(typeof id).toBe("number");
  expect(id).toBe(7);
});

test("el cliente queda guardado en la tabla con sus datos", () => {
  const id = crearCliente(db, ROSA);
  expect(buscarCliente(db, id)).toEqual({ id: 7, ...ROSA });
  expect(contarClientes(db)).toBe(7);
});

test("dos clientes seguidos reciben ids distintos y consecutivos", () => {
  expect(crearCliente(db, ROSA)).toBe(7);
  expect(crearCliente(db, { nombre: "Pedro Salas", email: "pedro.salas@correo.pe", ciudad: "Ica" })).toBe(8);
});

test("guarda los textos sin espacios sobrantes", () => {
  const id = crearCliente(db, { nombre: "  Pedro Salas ", email: " pedro.salas@correo.pe ", ciudad: " Ica " });
  expect(buscarCliente(db, id)).toEqual({ id, nombre: "Pedro Salas", email: "pedro.salas@correo.pe", ciudad: "Ica" });
});

test("valida nombre, email y ciudad antes de insertar, y no guarda nada si fallan", () => {
  expect(() => crearCliente(db, { ...ROSA, nombre: "   " })).toThrow("El nombre es obligatorio");
  expect(() => crearCliente(db, { ...ROSA, email: "rosa.correo.pe" })).toThrow("El email no es válido");
  expect(() => crearCliente(db, { ...ROSA, ciudad: "" })).toThrow("La ciudad es obligatoria");
  expect(contarClientes(db)).toBe(6);
});

test("no permite un email repetido y no guarda nada", () => {
  expect(() => crearCliente(db, { nombre: "Otra Ana", email: "ana.torres@correo.pe", ciudad: "Lima" })).toThrow(
    "El email ya está registrado",
  );
  expect(contarClientes(db)).toBe(6);
});

test("un nombre con apóstrofo se guarda bien (parámetros ?)", () => {
  const id = crearCliente(db, { nombre: "Rosa O'Neill", email: "rosa.oneill@correo.pe", ciudad: "Lima" });
  expect(buscarCliente(db, id).nombre).toBe("Rosa O'Neill");
});
