import express from "express";

const SESIONES = {
  "token-ana-123": { nombre: "Ana", rol: "admin" },
  "token-beto-456": { nombre: "Beto", rol: "usuario" },
};

/** 401 con el header que indica cómo autenticarse. */
function noAutenticado(res, mensaje) {
  res.set("WWW-Authenticate", "Bearer");
  return res.status(401).json({ error: mensaje });
}

/** Middleware: deja pasar solo si hay un token válido, y guarda quién es en req.usuario. */
function autenticar(req, res, next) {
  const cabecera = req.get("Authorization"); // undefined si no vino

  if (!cabecera) {
    return noAutenticado(res, "Falta el token");
  }
  if (!cabecera.startsWith("Bearer ")) {
    return noAutenticado(res, "Formato inválido: usa Bearer <token>");
  }

  const token = cabecera.slice("Bearer ".length); // lo que va después de "Bearer "
  const sesion = SESIONES[token];
  if (!sesion) {
    return noAutenticado(res, "Token inválido");
  }

  req.usuario = sesion; // las rutas siguientes ya saben quién es
  next();
}

/** Fábrica de middlewares: devuelve uno que exige cierto rol. Va DESPUÉS de autenticar. */
function soloRol(rol) {
  return (req, res, next) => {
    if (req.usuario.rol !== rol) {
      return res.status(403).json({ error: "No tienes permiso" });
    }
    next();
  };
}

export function crearApp() {
  const app = express();

  app.get("/publico", (req, res) => {
    res.json({ mensaje: "Esto lo ve cualquiera" });
  });

  // Middlewares por ruta: se ejecutan en orden, de izquierda a derecha.
  app.get("/perfil", autenticar, (req, res) => {
    res.json(req.usuario);
  });

  app.get("/admin/usuarios", autenticar, soloRol("admin"), (req, res) => {
    const usuarios = Object.values(SESIONES).map((s) => s.nombre);
    res.json({ usuarios });
  });

  return app;
}
