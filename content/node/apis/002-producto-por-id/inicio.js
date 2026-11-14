// Producto por id
//
// Exporta crearApp() con dos rutas:
//   GET /productos      ->  200  el arreglo completo
//   GET /productos/:id  ->  200  el producto, o 404 { error: "Producto no encontrado" }
//
//   GET /productos/2  ->  { id: 2, nombre: "Mouse", precio: 45 }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import express from "express";

const PRODUCTOS = [
  { id: 1, nombre: "Teclado", precio: 120 },
  { id: 2, nombre: "Mouse", precio: 45 },
  { id: 3, nombre: "Monitor", precio: 650 },
];

export function crearApp() {
  const app = express();

  // Tu código aquí

  return app;
}
