// Rutas de la sincronización con el celular: /api/sync y /api/sync/qr
import { Router } from "express";
import QRCode from "qrcode";

/** Dirección de la app del celular. El QR lleva ahí la URL y el token en el "#" (no viajan a ningún servidor). */
const APP_CELULAR = "https://dev-prep.angel-isasi.com/vincular";

export function rutasSync({ sync }) {
  const router = Router();

  router.get("/sync", (req, res) => res.json(sync.estado()));

  // La versión web abierta en esta laptop intercambia su progreso directamente (sin pasar por AWS).
  router.post("/sync/local", async (req, res) => {
    try {
      res.json(await sync.intercambioLocal(req.body?.dispositivo, req.body?.doc));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // "Sincronizar ahora"
  router.post("/sync", async (req, res) => res.json(await sync.sincronizar()));

  // QR para vincular el celular: lo escaneas con la cámara y queda configurado.
  const enlaceDe = (vinculo) => `${APP_CELULAR}#u=${encodeURIComponent(vinculo.url)}&t=${encodeURIComponent(vinculo.token)}`;

  router.get("/sync/qr", async (req, res) => {
    const vinculo = sync.vinculo();
    if (!vinculo) return res.status(404).json({ error: "La sincronización no está creada. Usa npm run aws:crear." });
    const enlace = enlaceDe(vinculo);
    const svg = await QRCode.toString(enlace, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0b0a12", light: "#ffffff" } });
    res.type("image/svg+xml").set("cache-control", "no-store").send(svg);
  });

  // "Vincular la versión web de esta laptop": abre el mismo enlace del QR en este navegador.
  router.get("/sync/vincular-web", (req, res) => {
    const vinculo = sync.vinculo();
    if (!vinculo) return res.status(404).json({ error: "La sincronización no está creada. Usa npm run aws:crear." });
    // "&local=1": esa web queda recordando que está en esta laptop y se conecta con dev-prep
    res.set("cache-control", "no-store").redirect(`${enlaceDe(vinculo)}&local=1`);
  });

  return router;
}
