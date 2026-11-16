// Quién puede hablar con el servidor de dev-prep desde el navegador.
//
// - La app local (misma dirección) y Vite en desarrollo: cualquier http://localhost:* o 127.0.0.1:*.
// - La versión web (dev-prep.angel-isasi.com) cuando la abres en tu laptop: así tiene VS Code,
//   tests en vivo y todo lo de la app local.
// Cualquier otra página recibe 403: ninguna web ajena puede abrir VS Code, reiniciar
// ejercicios ni apagar dev-prep aunque el servidor esté corriendo.

export const ORIGENES_WEB = ["https://dev-prep.angel-isasi.com"];
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/** @param {string | undefined} origen cabecera Origin (no viene en GET de la misma página) */
export const origenPermitido = (origen) => !origen || LOCAL.test(origen) || ORIGENES_WEB.includes(origen);

// Nombre con el que llega la petición (cabecera Host). Solo se acepta localhost o 127.0.0.1:
// así se bloquea el "DNS rebinding" (una web ajena que hace que su dominio apunte a tu laptop
// para leer tus datos: su Host seguiría siendo su dominio).
const HOST_LOCAL = /^(localhost|127\.0\.0\.1)(:\d+)?$/;

/** @param {string | undefined} host cabecera Host */
export const hostPermitido = (host) => HOST_LOCAL.test(host ?? "");

/** Middleware para /api: corta orígenes ajenos y agrega CORS para la versión web. */
export function controlDeOrigen(req, res, next) {
  if (!hostPermitido(req.headers.host)) return res.status(403).json({ error: "Host no permitido" });
  const origen = req.headers.origin;
  if (!origenPermitido(origen)) return res.status(403).json({ error: "Origen no permitido" });
  if (origen) {
    res.set("Access-Control-Allow-Origin", origen);
    res.set("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    // Chrome pide permiso explícito para que una web pública hable con tu laptop
    if (req.headers["access-control-request-private-network"]) res.set("Access-Control-Allow-Private-Network", "true");
    res.set("Access-Control-Max-Age", "600");
    return res.sendStatus(204);
  }
  next();
}
