// Tu primera API
//
// Exporta crearApp(): crea una app de Express con dos rutas y devuélvela
// SIN llamar a listen (los tests la levantan en un puerto libre).
//
//   GET /hola    ->  200  { mensaje: "Hola, mundo" }
//   GET /estado  ->  200  { ok: true, version: "1.0.0" }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import express from "express";

export function crearApp() {
  const app = express();

  // Tu código aquí

  return app;
}
