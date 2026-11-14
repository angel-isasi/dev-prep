import { test, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { cambiarPrecio, aplicarDescuento, borrarAgotados } from "./solucion.js";

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

const precios = (db) => db.prepare("SELECT id, precio FROM productos ORDER BY id").all();
const precioDe = (db, id) => db.prepare("SELECT precio FROM productos WHERE id = ?").get(id).precio;

let db;
beforeEach(() => {
  db = crearBase();
});

test("cambiarPrecio cambia solo ese producto y devuelve true", () => {
  const antes = precios(db);
  expect(cambiarPrecio(db, 2, 49)).toBe(true);
  expect(precioDe(db, 2)).toBe(49);
  // Todos los demás siguen igual: el WHERE hizo su trabajo.
  const despues = precios(db);
  expect(despues.filter((p) => p.id !== 2)).toEqual(antes.filter((p) => p.id !== 2));
});

test("cambiarPrecio de un id que no existe devuelve false", () => {
  expect(cambiarPrecio(db, 99, 49)).toBe(false);
});

test("cambiarPrecio rechaza precios inválidos sin cambiar nada", () => {
  const antes = precios(db);
  expect(() => cambiarPrecio(db, 2, 0)).toThrow("El precio debe ser mayor que cero");
  expect(() => cambiarPrecio(db, 2, -10)).toThrow("El precio debe ser mayor que cero");
  expect(() => cambiarPrecio(db, 2, "barato")).toThrow("El precio debe ser mayor que cero");
  expect(precios(db)).toEqual(antes);
});

test("aplicarDescuento baja los precios de la categoría y devuelve cuántos cambió", () => {
  expect(aplicarDescuento(db, "perifericos", 10)).toBe(3);
  expect(precioDe(db, 1)).toBeCloseTo(170.1, 2);
  expect(precioDe(db, 2)).toBeCloseTo(53.1, 2);
  expect(precioDe(db, 7)).toBeCloseTo(134.1, 2);
});

test("aplicarDescuento no toca las otras categorías y redondea a 2 decimales", () => {
  expect(aplicarDescuento(db, "monitores", 15)).toBe(2);
  expect(precioDe(db, 3)).toBe(551.65);
  expect(precioDe(db, 8)).toBe(849.15);
  expect(precioDe(db, 4)).toBe(2899);
  expect(precioDe(db, 1)).toBe(189);
  expect(aplicarDescuento(db, "juguetes", 10)).toBe(0);
});

test("aplicarDescuento rechaza porcentajes fuera de 1 a 99", () => {
  const antes = precios(db);
  expect(() => aplicarDescuento(db, "audio", 0)).toThrow("El porcentaje debe estar entre 1 y 99");
  expect(() => aplicarDescuento(db, "audio", 100)).toThrow("El porcentaje debe estar entre 1 y 99");
  expect(precios(db)).toEqual(antes);
});

test("borrarAgotados borra solo los de stock 0 y devuelve cuántos borró", () => {
  expect(borrarAgotados(db)).toBe(1);
  const quedan = db.prepare("SELECT nombre FROM productos").all().map((p) => p.nombre);
  expect(quedan).toHaveLength(7);
  expect(quedan).not.toContain("Audífonos con micrófono");
  expect(borrarAgotados(db)).toBe(0);
});
