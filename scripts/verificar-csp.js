// Corre después de "vite build --mode movil" (parte de npm run build:movil).
// La política de seguridad (CSP) de vercel.json solo permite el script en línea del index.html
// si su huella sha256 coincide. Si alguien edita ese script y olvida actualizar la huella, la
// página publicada quedaría con el tema roto: este chequeo hace fallar el build antes de publicar.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(path.join(RAIZ, "client", "dist-movil", "index.html"), "utf8");
const vercel = await readFile(path.join(RAIZ, "vercel.json"), "utf8");

const huellas = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
  ([, codigo]) => `'sha256-${createHash("sha256").update(codigo).digest("base64")}'`,
);
const faltan = huellas.filter((h) => !vercel.includes(h));
if (faltan.length) {
  console.error(`La CSP de vercel.json no permite el script en línea de index.html. Agrega a script-src: ${faltan.join(" ")}`);
  process.exit(1);
}
console.log(`CSP verificada (${huellas.length} script en línea permitido).`);
