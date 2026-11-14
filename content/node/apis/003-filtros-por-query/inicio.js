// Filtrar con query params
//
// Exporta crearApp() con GET /productos, que acepta filtros opcionales:
//   ?categoria=audio   solo esa categoría
//   ?max=100           solo precio <= 100
// Si max no es un número: 400 { error: "max debe ser un número" }
//
//   GET /productos?categoria=perifericos&max=150  ->  [Teclado, Mouse]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import express from "express";

const PRODUCTOS = [
  { id: 1, nombre: "Teclado", categoria: "perifericos", precio: 120 },
  { id: 2, nombre: "Mouse", categoria: "perifericos", precio: 45 },
  { id: 3, nombre: "Monitor", categoria: "pantallas", precio: 650 },
  { id: 4, nombre: "Audífonos", categoria: "audio", precio: 90 },
  { id: 5, nombre: "Parlante", categoria: "audio", precio: 150 },
  { id: 6, nombre: "Webcam", categoria: "perifericos", precio: 200 },
];

export function crearApp() {
  const app = express();

  // Tu código aquí: registra GET /productos.
  // Ojo: un handler que nunca responde deja la petición colgada
  // y el test termina por tiempo (timeout).

  return app;
}
