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
    // Si leerReporte falla, Express 5 atrapa el rechazo de la promesa
    // y lo manda al middleware de errores. No hace falta try/catch.
    const reporte = await leerReporte();
    res.json(reporte);
  });

  app.get("/productos/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw errorHttp(400, "El id debe ser un número entero positivo");
    }

    const producto = await buscarProducto(id);
    if (!producto) {
      throw errorHttp(404, "Producto no encontrado");
    }

    res.json(producto); // la ruta solo se ocupa del camino feliz
  });

  // Si ninguna ruta respondió, llegamos aquí: 404 en JSON.
  app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
  });

  // Middleware de errores: 4 parámetros. Express lo usa solo cuando hay un error.
  // Aunque no usemos next, tiene que estar: Express cuenta los parámetros.
  app.use((err, req, res, next) => {
    const status = err.status ?? 500;
    // En un 500 el mensaje real puede traer secretos: se responde algo genérico.
    // (En un proyecto real aquí harías console.error(err) para verlo en los logs del servidor.)
    const mensaje = status >= 500 ? "Error interno del servidor" : err.message;
    res.status(status).json({ error: mensaje });
  });

  return app;
}
