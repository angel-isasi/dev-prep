// Exporta un ejercicio de componente que resolviste a un mini proyecto listo para GitHub:
// Documentos/portafolio/<slug>/ con Vite, tu solución, sus tests, una demo y un README que incluye
// tu "Explícalo con tus palabras". La carpeta queda fuera de dev-prep: es tuya.
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/** Fichas de content/portafolio (qué ejercicios se pueden exportar y con qué demo). */
export async function cargarPortafolio(contenidoDir) {
  const dir = path.join(contenidoDir, "portafolio");
  const archivos = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json")).sort();
  return Promise.all(archivos.map(async (f) => JSON.parse(await readFile(path.join(dir, f), "utf8"))));
}

export const carpetaPortafolio = () => path.join(os.homedir(), "Documents", "portafolio");

const slug = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** README del mini proyecto. Solo tu nombre como autor. */
export function readmePortafolio({ ficha, explicacion, nombre }) {
  const lineas = [
    `# ${ficha.titulo}`,
    "",
    ficha.descripcion,
    "",
    "## Qué demuestra",
    "",
    ...(ficha.aprendido ?? []).map((a) => `- ${a}`),
    "",
  ];
  if (explicacion?.trim()) lineas.push("## Cómo lo resolví", "", explicacion.trim(), "");
  lineas.push(
    "## Cómo correrlo",
    "",
    "```bash",
    "npm install",
    "npm run dev     # abre la demo",
    "npm test        # corre los tests",
    "```",
    "",
    "## Tecnologías",
    "",
    "React, Vite, Vitest y Testing Library.",
    "",
  );
  if (nombre) lineas.push(`Hecho por ${nombre}.`, "");
  return lineas.join("\n");
}

/**
 * @param {object} p
 * @param {object} p.ficha        de content/portafolio
 * @param {string} p.solucion     tu código (workspace/<id>/solucion.jsx)
 * @param {string} p.tests        los tests del ejercicio
 * @param {string} p.explicacion  tu "Explícalo con tus palabras"
 * @param {string} p.nombre       tu nombre (de Ajustes)
 * @param {object} p.versiones    versiones de dependencias (del package.json de dev-prep)
 * @param {string} [p.destinoBase]
 * @returns {Promise<string>} carpeta creada
 */
export async function exportarPortafolio({ ficha, solucion, tests, explicacion, nombre, versiones, destinoBase = carpetaPortafolio() }) {
  const componente = ficha.demo.match(/from\s+["']\.\/([A-Za-z0-9_]+)\.jsx["']/)?.[1] ?? "Componente";
  const destino = path.join(destinoBase, slug(ficha.titulo));
  await mkdir(path.join(destino, "src"), { recursive: true });
  const v = (nombreDep) => versiones[nombreDep] ?? "latest";
  const paquete = {
    name: slug(ficha.titulo),
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: { dev: "vite", build: "vite build", test: "vitest run" },
    dependencies: { react: v("react"), "react-dom": v("react-dom") },
    devDependencies: {
      vite: v("vite"),
      "@vitejs/plugin-react": v("@vitejs/plugin-react"),
      vitest: v("vitest"),
      jsdom: v("jsdom"),
      "@testing-library/react": v("@testing-library/react"),
      "@testing-library/user-event": v("@testing-library/user-event"),
    },
  };
  const archivos = {
    "package.json": JSON.stringify(paquete, null, 2) + "\n",
    "vite.config.js": `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({ plugins: [react()] });\n`,
    "index.html": `<!doctype html>\n<html lang="es">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${ficha.titulo}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n`,
    "src/main.jsx": `import { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\n\ncreateRoot(document.getElementById("root")).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n);\n`,
    "src/App.jsx": ficha.demo.endsWith("\n") ? ficha.demo : `${ficha.demo}\n`,
    [`src/${componente}.jsx`]: solucion,
    [`src/${componente}.test.jsx`]: tests.replace(/from\s+["']\.\/solucion\.jsx["']/g, `from "./${componente}.jsx"`),
    "README.md": readmePortafolio({ ficha, explicacion, nombre }),
    ".gitignore": "node_modules\ndist\n",
  };
  for (const [ruta, contenido] of Object.entries(archivos)) await writeFile(path.join(destino, ruta), contenido);
  return destino;
}

/** ¿Ya existe la carpeta exportada de una ficha? */
export const yaExportado = (ficha, destinoBase = carpetaPortafolio()) => existsSync(path.join(destinoBase, slug(ficha.titulo), "package.json"));
