// Las llamadas al servidor de la app local (ver api-servidor.js).
// En la versión web, Vite cambia este archivo por api-movil.js (ver vite.config.js).
import { crearApi } from "./api-servidor.js";

export const api = crearApi();
