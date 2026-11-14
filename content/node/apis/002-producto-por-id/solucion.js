import express from "express";

const PRODUCTOS = [
  { id: 1, nombre: "Teclado", precio: 120 },
  { id: 2, nombre: "Mouse", precio: 45 },
  { id: 3, nombre: "Monitor", precio: 650 },
];

export function crearApp() {
  const app = express();

  app.get("/productos", (req, res) => {
    res.json(PRODUCTOS);
  });

  // ":id" es un parámetro de ruta: Express guarda lo que venga en req.params.id.
  app.get("/productos/:id", (req, res) => {
    // Lo que viene en la URL siempre es texto: "2", no 2.
    const id = Number(req.params.id); // "abc" -> NaN, que no coincide con ningún id
    const producto = PRODUCTOS.find((p) => p.id === id);

    if (!producto) {
      // return: después de responder, no sigas ejecutando el handler.
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto); // 200 por defecto
  });

  return app;
}
