// npm run validar:ingles -> revisa el contenido de content/ingles (formato: docs/guia-ingles.md).
import { config } from "../server/config.js";
import { cargarIngles, revisarIngles } from "../server/ingles.js";

const { unidades, errores } = await cargarIngles(config.contenidoDir);
const problemas = [...errores, ...revisarIngles(unidades)];

const contar = (campo) => unidades.reduce((n, u) => n + u[campo].length, 0);
console.log(
  `Inglés: ${unidades.length} unidades, ${contar("palabras")} palabras, ${contar("frases")} frases, ` +
    `${contar("ejercicios")} ejercicios y ${contar("dialogos")} diálogos.`,
);
if (problemas.length) {
  console.log(`\n${problemas.length} problema(s):`);
  for (const p of problemas) console.log(`  - ${p}`);
  process.exit(1);
}
console.log("Todo en orden.");
