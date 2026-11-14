// CRUD de tareas
//
// Exporta crearApp() con:
//   GET    /tareas      ->  200 lista
//   GET    /tareas/:id  ->  200 tarea | 404
//   POST   /tareas      ->  201 tarea nueva { id, titulo, hecha: false } | 400
//   PUT    /tareas/:id  ->  200 tarea reemplazada | 404 | 400
//   DELETE /tareas/:id  ->  204 sin cuerpo | 404
//
//   POST { titulo: "Leer sobre REST" }  ->  201 { id: 3, titulo: "Leer sobre REST", hecha: false }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import express from "express";

export function crearApp() {
  const app = express();
  app.use(express.json());

  // Datos en memoria: cada crearApp() tiene los suyos.
  const tareas = [
    { id: 1, titulo: "Estudiar Express", hecha: false },
    { id: 2, titulo: "Practicar SQL", hecha: true },
  ];

  // Tu código aquí

  return app;
}
