// Rutas de la sincronización con el celular: /api/sync y /api/sync/qr
import { Router } from "express";
import QRCode from "qrcode";

/** Dirección de la app del celular. El QR lleva ahí la URL y el token en el "#" (no viajan a ningún servidor). */
const APP_CELULAR = "https://dev-prep.angel-isasi.com/vincular";

export function rutasSync({ sync }) {
  const router = Router();

  router.get("/sync", (req, res) => res.json(sync.estado()));

  // "Sincronizar ahora"
  router.post("/sync", async (req, res) => res.json(await sync.sincronizar()));

  // QR para vincular el celular: lo escaneas con la cámara y queda configurado.
  router.get("/sync/qr", async (req, res) => {
    const vinculo = sync.vinculo();
    if (!vinculo) return res.status(404).json({ error: "La sincronización no está creada. Usa npm run aws:crear." });
    const enlace = `${APP_CELULAR}#u=${encodeURIComponent(vinculo.url)}&t=${encodeURIComponent(vinculo.token)}`;
    const svg = await QRCode.toString(enlace, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0b0a12", light: "#ffffff" } });
    res.type("image/svg+xml").set("cache-control", "no-store").send(svg);
  });

  return router;
}
