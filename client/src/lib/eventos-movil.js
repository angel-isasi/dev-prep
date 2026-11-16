// Versión web de eventos.js. En el celular no hay tests en vivo: escuchar no hace nada.
// En tu laptop, con dev-prep abierto, escucha los tests en vivo de ese dev-prep.
import { crearEscucha } from "./eventos-servidor.js";
import { BASE_LOCAL, conectada } from "./conexion-local.js";

let local = null;

export function escuchar(tipo, callback) {
  if (!conectada()) return () => {};
  local ??= crearEscucha(BASE_LOCAL);
  return local(tipo, callback);
}
