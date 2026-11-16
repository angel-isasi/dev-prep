import { afterAll, describe, expect, test } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { exportarPortafolio, readmePortafolio } from "./portafolio.js";

const temporales = [];
afterAll(() => Promise.all(temporales.map((t) => rm(t, { recursive: true, force: true }))));

describe("portafolio", () => {
  const ficha = {
    ejercicio: "react-ej-012",
    titulo: "Buscador de pizzas",
    descripcion: "Filtra una lista mientras escribes.",
    aprendido: ["Estado controlado", "Filtrar sin mutar"],
    demo: 'import { Buscador } from "./Buscador.jsx";\n\nexport default function App() {\n  return <Buscador pizzas={[]} />;\n}',
  };

  test("crea un proyecto Vite con tu solución, los tests apuntando a tu componente y un README", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "portafolio-"));
    temporales.push(base);
    const destino = await exportarPortafolio({
      ficha,
      solucion: "export function Buscador() { return null; }\n",
      tests: 'import { Buscador } from "./solucion.jsx";\n',
      explicacion: "Uso un estado para el texto y filtro con filter.",
      nombre: "Angel Isasi",
      versiones: { react: "^19.0.0", vite: "^8.0.0" },
      destinoBase: base,
    });
    expect(path.basename(destino)).toBe("buscador-de-pizzas");
    expect(await readFile(path.join(destino, "src", "Buscador.test.jsx"), "utf8")).toContain('from "./Buscador.jsx"');
    const paquete = JSON.parse(await readFile(path.join(destino, "package.json"), "utf8"));
    expect(paquete.dependencies.react).toBe("^19.0.0");
    const readme = await readFile(path.join(destino, "README.md"), "utf8");
    expect(readme).toContain("## Cómo lo resolví");
    expect(readme).toContain("Hecho por Angel Isasi.");
  });

  test("el README no menciona herramientas de terceros como autoras", () => {
    const readme = readmePortafolio({ ficha, explicacion: "", nombre: "Angel" });
    expect(readme).not.toMatch(/generad[oa] (con|por)|co-?authored/i);
  });
});
