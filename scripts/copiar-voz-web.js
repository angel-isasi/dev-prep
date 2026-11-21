// Copia a client/public-movil/voz-web/ lo que la voz neuronal necesita para correr dentro del
// navegador (client/src/aksu/voz-web.js): el motor de inferencia (onnxruntime) y el programa que
// convierte texto en fonemas (piper_phonemize, con sus datos de pronunciación). Salen de
// node_modules en cada build, así no se guardan 30 MB de binarios en el repositorio.
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = path.join(RAIZ, "client", "public-movil", "voz-web");
const ORT = path.join(RAIZ, "node_modules", "onnxruntime-web", "dist");
const PIPER = path.join(RAIZ, "node_modules", "@diffusionstudio", "piper-wasm", "build");

const ARCHIVOS = [
  [ORT, "ort-wasm-simd.wasm"],
  [ORT, "ort-wasm.wasm"],
  [PIPER, "piper_phonemize.js"],
  [PIPER, "piper_phonemize.wasm"],
  [PIPER, "piper_phonemize.data"],
];

await mkdir(DESTINO, { recursive: true });
for (const [carpeta, nombre] of ARCHIVOS) await copyFile(path.join(carpeta, nombre), path.join(DESTINO, nombre));
console.log(`Voz en el navegador: ${ARCHIVOS.length} archivos copiados a client/public-movil/voz-web/`);
