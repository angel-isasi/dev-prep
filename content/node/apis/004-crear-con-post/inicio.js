// Crear con POST
//
// Exporta crearApp() con:
//   GET  /usuarios  ->  200  la lista
//   POST /usuarios  ->  201  el usuario creado (+ header Location)
//                       400  { error: "El nombre es obligatorio" } o { error: "El email no es válido" }
//
//   POST { nombre: "Beto", email: "beto@correo.com" }  ->  201 { id: 2, nombre: "Beto", email: "beto@correo.com" }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import express from "express";

export function crearApp() {
  const app = express();

  // Datos en memoria: cada crearApp() empieza de cero.
  const usuarios = [{ id: 1, nombre: "Ana", email: "ana@correo.com" }];

  // Tu código aquí

  return app;
}
