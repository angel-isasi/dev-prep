// Middleware de registro
//
// Exporta crearApp(registro). Agrega dos middlewares ANTES de las rutas:
//   1. Por cada petición: registro.push({ metodo: req.method, ruta: req.path })
//   2. En toda respuesta: header X-Api-Version: 1
// Y no olvides llamar a next() para que la petición siga su camino.
//
//   GET /saludo  ->  registro = [{ metodo: "GET", ruta: "/saludo" }]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import express from "express";

export function crearApp(registro) {
  const app = express();

  // Tu código aquí (los middlewares van antes de las rutas)

  app.get("/saludo", (req, res) => {
    res.json({ mensaje: "Hola" });
  });

  app.get("/productos", (req, res) => {
    res.json([{ id: 1, nombre: "Teclado" }]);
  });

  return app;
}
