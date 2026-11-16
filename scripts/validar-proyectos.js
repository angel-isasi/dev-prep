// npm run validar:proyectos [-- filtro]
// Revisa cada prueba técnica y cada proyecto guiado (docs/guia-proyectos.md):
//   - El punto de partida (inicio/) NO pasa todos los tests.
//   - El punto de partida más la solución (solucion/) SÍ los pasa todos.
//   - En los proyectos guiados, cada etapa se prueba con la solución de esa etapa (etapas/NN/solucion/).
import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { config } from "../server/config.js";
import { cargarProyectos, correrTestsDe } from "../server/proyectos.js";

const FILTRO = process.argv[2] ?? "";
const TMP = path.join(config.raiz, `.validar-proyectos-${process.pid}`);
const proyectos = (await cargarProyectos(config.contenidoDir)).filter((p) => !FILTRO || p.id.includes(FILTRO));
let malos = 0;

async function probar(nombre, armar) {
  const dir = path.join(TMP, nombre.replace(/[^a-z0-9-]/gi, "_"));
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await armar(dir);
  return correrTestsDe(config.raiz, dir);
}

const copiar = async (desde, hacia) => existsSync(desde) && cp(desde, hacia, { recursive: true, force: true });

try {
  for (const p of proyectos) {
    const problemas = [];
    if (!p.enunciado) problemas.push("falta enunciado.md");
    if (p.tipo === "pruebas") {
      const inicio = await probar(`${p.id}-inicio`, (d) => copiar(path.join(p.carpeta, "inicio"), d));
      if (inicio.total < 4) problemas.push(`tiene ${inicio.total} tests (mínimo 4)`);
      if (inicio.total && inicio.pasan === inicio.total) problemas.push("el punto de partida ya pasa todos los tests");
      const sol = await probar(`${p.id}-solucion`, async (d) => {
        await copiar(path.join(p.carpeta, "inicio"), d);
        await copiar(path.join(p.carpeta, "solucion"), d);
      });
      if (sol.pasan !== sol.total || !sol.total) problemas.push(`la solución pasa ${sol.pasan}/${sol.total}: ${sol.archivos.flatMap((a) => [a.error, ...(a.casos ?? []).filter((c) => !c.ok).map((c) => c.nombre)]).filter(Boolean).slice(0, 3).join("; ")}`);
      if (!p.rubrica.length) problemas.push("falta rubrica.json");
    } else {
      if (!p.etapas.length) problemas.push("no tiene etapas");
      for (const [i, etapa] of p.etapas.entries()) {
        const r = await probar(`${p.id}-${etapa.id}`, async (d) => {
          await copiar(path.join(p.carpeta, "inicio"), d);
          for (const anterior of p.etapas.slice(0, i + 1)) {
            await copiar(path.join(p.carpeta, "etapas", anterior.id, "solucion"), d);
            await copiar(path.join(p.carpeta, "etapas", anterior.id, "tests"), path.join(d, "tests"));
          }
        });
        if (!r.total || r.pasan !== r.total) problemas.push(`etapa ${etapa.id}: la solución acumulada pasa ${r.pasan}/${r.total}`);
      }
    }
    console.log(`${problemas.length ? "❌" : "✅"} ${p.id}  ${p.titulo}`);
    for (const x of problemas) console.log(`     - ${x}`);
    if (problemas.length) malos++;
  }
} finally {
  await rm(TMP, { recursive: true, force: true });
}
console.log(`\n${proyectos.length - malos}/${proyectos.length} válidos.`);
process.exit(malos ? 1 : 0);
