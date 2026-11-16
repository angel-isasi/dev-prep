// Íconos de la versión celular (npx pwa-assets-generator): salen de client/public-movil/icono.svg.
// El ícono "maskable" (Android lo recorta en círculo o en gota) y el de Apple llevan fondo oscuro.
import { defineConfig, minimal2023Preset as base } from "@vite-pwa/assets-generator/config";

const fondo = { background: "#0d0d11" };

export default defineConfig({
  preset: {
    ...base,
    maskable: { ...base.maskable, resizeOptions: fondo },
    apple: { ...base.apple, resizeOptions: fondo },
  },
  images: ["client/public-movil/icono.svg"],
});
