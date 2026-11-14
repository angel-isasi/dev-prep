import { test, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { ventasPorCategoria, categoriasQueSuperan, ventasDesde } from "./solucion.js";

// Cada test recibe una base nueva en memoria, con las mismas tablas y datos.
function crearBase() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE ventas (
      id INTEGER PRIMARY KEY,
      producto TEXT NOT NULL,
      categoria TEXT NOT NULL,
      monto REAL NOT NULL,
      fecha TEXT NOT NULL
    );
    INSERT INTO ventas (id, producto, categoria, monto, fecha) VALUES
      (1, 'Teclado mecánico', 'perifericos', 189, '2026-10-02'),
      (2, 'Mouse inalámbrico', 'perifericos', 118, '2026-10-02'),
      (3, 'Laptop 14 pulgadas', 'computadoras', 2899, '2026-10-05'),
      (4, 'Monitor 24 pulgadas', 'monitores', 1298, '2026-10-07'),
      (5, 'Parlante bluetooth', 'audio', 297, '2026-10-10'),
      (6, 'Mouse inalámbrico', 'perifericos', 59, '2026-10-12'),
      (7, 'Webcam HD', 'perifericos', 149, '2026-10-15'),
      (8, 'Monitor 27 pulgadas', 'monitores', 999, '2026-10-20'),
      (9, 'Teclado mecánico', 'perifericos', 189, '2026-10-22'),
      (10, 'Audífonos con micrófono', 'audio', 129, '2026-10-25');
  `);
  return db;
}

let db;
beforeEach(() => {
  db = crearBase();
});

test("ventasPorCategoria devuelve una fila por categoría", () => {
  const filas = ventasPorCategoria(db);
  expect(filas).toHaveLength(4);
  for (const fila of filas) {
    expect(Object.keys(fila).sort()).toEqual(["categoria", "total", "ventas"]);
  }
});

test("ventasPorCategoria cuenta y suma dentro de cada grupo, de mayor a menor total", () => {
  expect(ventasPorCategoria(db)).toEqual([
    { categoria: "computadoras", ventas: 1, total: 2899 },
    { categoria: "monitores", ventas: 2, total: 2297 },
    { categoria: "perifericos", ventas: 5, total: 704 },
    { categoria: "audio", ventas: 2, total: 426 },
  ]);
});

test("categoriasQueSuperan filtra los grupos por su total (HAVING)", () => {
  expect(categoriasQueSuperan(db, 1000)).toEqual([
    { categoria: "computadoras", total: 2899 },
    { categoria: "monitores", total: 2297 },
  ]);
  expect(categoriasQueSuperan(db, 500).map((c) => c.categoria)).toEqual(["computadoras", "monitores", "perifericos"]);
});

test("categoriasQueSuperan incluye el mínimo exacto y devuelve [] si ninguna llega", () => {
  expect(categoriasQueSuperan(db, 704).map((c) => c.categoria)).toContain("perifericos");
  expect(categoriasQueSuperan(db, 10000)).toEqual([]);
});

test("ventasDesde solo cuenta las ventas desde esa fecha (WHERE antes de agrupar)", () => {
  expect(ventasDesde(db, "2026-10-15")).toEqual([
    { categoria: "monitores", ventas: 1, total: 999 },
    { categoria: "perifericos", ventas: 2, total: 338 },
    { categoria: "audio", ventas: 1, total: 129 },
  ]);
});

test("ventasDesde con una fecha futura no trae grupos", () => {
  expect(ventasDesde(db, "2027-01-01")).toEqual([]);
});

test("una venta nueva cambia el reporte", () => {
  db.prepare("INSERT INTO ventas (producto, categoria, monto, fecha) VALUES (?, ?, ?, ?)").run(
    "Laptop 14 pulgadas",
    "computadoras",
    2899,
    "2026-10-28",
  );
  expect(ventasPorCategoria(db)[0]).toEqual({ categoria: "computadoras", ventas: 2, total: 5798 });
});
