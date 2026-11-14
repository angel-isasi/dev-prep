// Paginación
//
// Exporta crearApp() con GET /articulos?page=&limit=
//   page por defecto 1, limit por defecto 10 (máximo 50)
//   responde { datos, pagina, limite, total, paginas }
//   page o limit que no sean enteros >= 1  ->  400
//
//   GET /articulos?page=2&limit=5  ->  { datos: [ids 6 a 10], pagina: 2, limite: 5, total: 23, paginas: 5 }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import express from "express";

const ARTICULOS = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  titulo: `Artículo ${i + 1}`,
}));

export function crearApp() {
  const app = express();

  // Tu código aquí

  return app;
}
