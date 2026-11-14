import express from "express";

export function crearApp() {
  // express() crea la aplicación: un objeto al que le registras rutas.
  const app = express();

  // app.get(ruta, handler): "cuando llegue un GET a /hola, ejecuta esta función".
  // req = la petición que llegó; res = la respuesta que vas a armar.
  app.get("/hola", (req, res) => {
    // res.json convierte el objeto a texto JSON, pone Content-Type: application/json
    // y envía la respuesta con código 200 (el valor por defecto).
    res.json({ mensaje: "Hola, mundo" });
  });

  app.get("/estado", (req, res) => {
    res.json({ ok: true, version: "1.0.0" });
  });

  // No hay listen: quien use crearApp decide en qué puerto levantarla.
  return app;
}
