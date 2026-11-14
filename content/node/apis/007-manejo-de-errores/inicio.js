// Manejo de errores
//
// Exporta crearApp() con:
//   GET /productos/:id  ->  200 producto | 400 id inválido | 404 no existe
//   GET /reporte        ->  500 { error: "Error interno del servidor" } (sin filtrar el mensaje real)
//   otra ruta           ->  404 { error: "Ruta no encontrada" }
// Las rutas LANZAN errores (throw errorHttp(...)) y un middleware de errores
// (4 parámetros: err, req, res, next) al final decide qué responder.
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import express from "express";

const PRODUCTOS = [
  { id: 1, nombre: "Teclado", precio: 120 },
  { id: 2, nombre: "Mouse", precio: 45 },
];

/** Simula una consulta a la base de datos (tarda un poquito). */
async function buscarProducto(id) {
  await new Promise((resolver) => setTimeout(resolver, 5));
  return PRODUCTOS.find((p) => p.id === id) ?? null;
}

/** Simula una consulta que falla. El mensaje trae datos secretos. */
async function leerReporte() {
  await new Promise((resolver) => setTimeout(resolver, 5));
  throw new Error("Conexión rechazada: postgres://admin:clave123@10.0.0.5:5432/tienda");
}

/** Crea un error que sabe qué código HTTP le corresponde. */
function errorHttp(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export function crearApp() {
  const app = express();

  app.get("/reporte", async (req, res) => {
    const reporte = await leerReporte(); // esto falla: ¿quién atrapa el error?
    res.json(reporte);
  });

  // Tu código aquí:
  //   1. GET /productos/:id (async): valida el id, busca y lanza errores con errorHttp
  //   2. Un middleware para las rutas que no existen (404 en JSON)
  //   3. El middleware de errores (4 parámetros), al final

  return app;
}
