// Eventos en vivo de la app local (ver eventos-servidor.js).
// En la versión web, Vite cambia este archivo por eventos-movil.js.
import { crearEscucha } from "./eventos-servidor.js";

export const escuchar = crearEscucha();
