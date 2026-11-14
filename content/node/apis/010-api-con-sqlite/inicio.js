// API con base de datos
//
// Exporta crearApp(db). db es una base SQLite (node:sqlite) con la tabla
// libros (id, titulo, autor, anio). Rutas:
//   GET  /libros            ->  200 todos por id (con ?autor= filtra)
//   GET  /libros/:id        ->  200 libro | 404 { error: "Libro no encontrado" }
//   POST /libros            ->  201 libro creado | 400
// Usa SIEMPRE parámetros "?" en el SQL, nunca concatenes texto.
//
//   db.prepare("SELECT * FROM libros WHERE id = ?").get(2)  ->  { id: 2, ... }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import express from "express";

export function crearApp(db) {
  const app = express();
  app.use(express.json());

  // Tu código aquí

  return app;
}
