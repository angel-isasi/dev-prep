import express from "express";

export function crearApp(registro) {
  const app = express();

  // Middleware 1: registra cada petición.
  // app.use sin ruta = se ejecuta para TODAS las peticiones, de cualquier método.
  app.use((req, res, next) => {
    // req.path es el camino sin la query string ("/productos", no "/productos?x=1").
    registro.push({ metodo: req.method, ruta: req.path });
    next(); // sin esto, la petición se queda colgada aquí
  });

  // Middleware 2: agrega un header a todas las respuestas.
  // Se pone ANTES de que alguien responda; los headers viajan con la respuesta.
  app.use((req, res, next) => {
    res.set("X-Api-Version", "1");
    next();
  });

  // Las rutas van después: así toda petición pasa primero por los middlewares.
  app.get("/saludo", (req, res) => {
    res.json({ mensaje: "Hola" });
  });

  app.get("/productos", (req, res) => {
    res.json([{ id: 1, nombre: "Teclado" }]);
  });

  return app;
}
