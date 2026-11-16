// Ruta del motor para "Ofertas para ti": busca en las 4 bolsas de trabajo (Get on Board solo se puede
// leer desde aquí, porque no permite que el navegador lo lea directo). El puntaje lo calcula la web,
// que tiene tu mapa de dominio.
//   GET /api/ofertas/buscar          ofertas normalizadas (caché de 3 horas)
//   GET /api/ofertas/buscar?nuevo=1  sin caché
import { Router } from "express";
import { buscarOfertas } from "../ofertas-auto.js";

const TRES_HORAS = 3 * 60 * 60 * 1000;
const pedir = (url, opciones = {}) =>
  fetch(url, { ...opciones, headers: { ...opciones.headers, "User-Agent": "dev-prep (app personal de estudio)" } });

export function rutasOfertasAuto() {
  const router = Router();
  let cache = null;
  router.get("/ofertas/buscar", async (req, res) => {
    if (!cache || req.query.nuevo === "1" || Date.now() - cache.en > TRES_HORAS) {
      cache = { en: Date.now(), ...(await buscarOfertas(pedir)) };
    }
    res.json({ ofertas: cache.ofertas, fuentes: cache.fuentes, buscadoEn: new Date(cache.en).toISOString() });
  });
  return router;
}
