// Ruta protegida con token
//
// Exporta crearApp() con:
//   GET /publico          ->  cualquiera (ya está hecha)
//   GET /perfil           ->  token válido en "Authorization: Bearer <token>"
//   GET /admin/usuarios   ->  token válido y rol "admin"
// 401 si no sé quién eres (con header WWW-Authenticate: Bearer), 403 si no tienes permiso.
//
//   GET /perfil  con  Authorization: Bearer token-beto-456  ->  { nombre: "Beto", rol: "usuario" }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import express from "express";

const SESIONES = {
  "token-ana-123": { nombre: "Ana", rol: "admin" },
  "token-beto-456": { nombre: "Beto", rol: "usuario" },
};

export function crearApp() {
  const app = express();

  app.get("/publico", (req, res) => {
    res.json({ mensaje: "Esto lo ve cualquiera" });
  });

  // Tu código aquí:
  //   1. Un middleware autenticar(req, res, next)
  //   2. GET /perfil y GET /admin/usuarios usando ese middleware

  return app;
}
