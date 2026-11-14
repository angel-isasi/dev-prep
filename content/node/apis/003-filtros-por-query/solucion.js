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

  app.get("/productos", (req, res) => {
    // req.query tiene lo que va después del "?", todo como texto.
    const { categoria, max } = req.query;

    // 1. Validar antes de filtrar. "" (vacío) es falsy, así que ?max= se ignora.
    //    Ojo: "0" (texto) es truthy, así que ?max=0 sí se aplica.
    let precioMaximo = null;
    if (max) {
      precioMaximo = Number(max);
      if (Number.isNaN(precioMaximo)) {
        return res.status(400).json({ error: "max debe ser un número" });
      }
    }

    // 2. Filtrar paso a paso: cada filtro solo actúa si vino.
    let resultado = PRODUCTOS;
    if (categoria) {
      resultado = resultado.filter((p) => p.categoria === categoria);
    }
    if (precioMaximo !== null) {
      resultado = resultado.filter((p) => p.precio <= precioMaximo);
    }

    res.json(resultado); // [] también es una respuesta válida (200)
  });

  return app;
}
