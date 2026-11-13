// npm run validar:aprender
// Revisa los temas de Aprender (secciones, 3-5 ejercicios que existan, quiz de 5+)
// y las entradas de la Referencia (todos los campos, ids únicos).
import { config } from "../server/config.js";
import { escanearContenido } from "../server/contenido.js";
import { cargarReferencia, cargarTemas, revisarTema } from "../server/aprender.js";

const { ejercicios } = await escanearContenido(config.contenidoDir);
const ids = new Set(ejercicios.map((e) => e.id));
const { temas, errores } = await cargarTemas(config.contenidoDir);
let malos = errores.length;

for (const e of errores) console.log(`  ❌ ${e}`);
for (const tema of temas) {
  const problemas = revisarTema(tema, ids);
  if (problemas.length === 0) console.log(`  ✅ ${tema.id}  ${tema.titulo} (${tema.quiz.length} preguntas de quiz)`);
  else {
    malos++;
    console.log(`  ❌ ${tema.id ?? tema.carpeta}`);
    for (const p of problemas) console.log(`       - ${p}`);
  }
}

const referencia = await cargarReferencia(config.contenidoDir);
for (const e of referencia.errores) console.log(`  ❌ ${e}`);
malos += referencia.errores.length;
for (const c of referencia.categorias) console.log(`  📚 ${c.nombre}: ${c.total} entradas`);

console.log(`\n${temas.length} temas, ${referencia.entradas.length} entradas de referencia, ${malos} problema(s).`);
process.exitCode = malos ? 1 : 0;
