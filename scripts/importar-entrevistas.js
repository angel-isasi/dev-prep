// node scripts/importar-entrevistas.js <carpeta-origen>
// Convierte los simulacros de entrevista en Markdown (formato "### N. Pregunta",
// "*English question*", "**Di esto:**", "**In English:**") a
// content/entrevistas/preguntas/<categoria>.json. Conserva las "claves" que ya
// existan en los JSON (lo que el entrevistador quiere escuchar), para no perderlas.
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../server/config.js";

const origen = process.argv[2];
if (!origen) {
  console.error("Uso: node scripts/importar-entrevistas.js <carpeta con los .md>");
  process.exit(1);
}
const destino = path.join(config.contenidoDir, "entrevistas", "preguntas");

const slug = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Saca el texto entre comillas de "**Di esto:** "...""; si no hay comillas, todo el bloque. */
function limpiar(bloque) {
  const t = bloque.trim();
  return t.startsWith('"') && t.endsWith('"') ? t.slice(1, -1).trim() : t;
}

function parsear(markdown) {
  const preguntas = [];
  let categoria = "General";
  const lineas = markdown.split(/\r?\n/);
  let actual = null;

  const cerrar = () => {
    if (!actual) return;
    const cuerpo = actual.lineas.join("\n").replace(/\n---\s*$/, "").trim();
    const en = cuerpo.match(/^\*(.+)\*\s*$/m);
    const iDi = cuerpo.indexOf("**Di esto:**");
    const iEn = cuerpo.indexOf("**In English:**");
    const respuesta = iDi >= 0 ? cuerpo.slice(iDi + 12, iEn >= 0 ? iEn : undefined) : cuerpo;
    const respuestaEn = iEn >= 0 ? cuerpo.slice(iEn + 15) : "";
    preguntas.push({
      numero: actual.numero,
      categoria: actual.categoria,
      pregunta: actual.pregunta,
      preguntaEn: en ? en[1].trim() : "",
      respuesta: limpiar(respuesta.replace(/^\*.+\*\s*$/m, "")),
      respuestaEn: limpiar(respuestaEn.replace(/\n---[\s\S]*$/, "")),
    });
    actual = null;
  };

  for (const linea of lineas) {
    const cat = linea.match(/^## (.+)$/);
    const preg = linea.match(/^### (\d+)\. (.+)$/);
    if (cat) {
      cerrar();
      categoria = cat[1].trim();
    } else if (preg) {
      cerrar();
      actual = { numero: Number(preg[1]), pregunta: preg[2].trim(), categoria, lineas: [] };
    } else if (actual) {
      actual.lineas.push(linea);
    }
  }
  cerrar();
  return preguntas;
}

// Busca todos los .md dentro de la carpeta de origen
async function buscarMd(dir) {
  const entradas = await readdir(dir, { withFileTypes: true });
  const rutas = await Promise.all(
    entradas.map((e) =>
      e.isDirectory() ? buscarMd(path.join(dir, e.name)) : e.name.endsWith(".md") ? [path.join(dir, e.name)] : [],
    ),
  );
  return rutas.flat();
}

const todas = [];
for (const archivo of await buscarMd(origen)) {
  todas.push(...parsear(await readFile(archivo, "utf8")));
}
todas.sort((a, b) => a.numero - b.numero);

await mkdir(destino, { recursive: true });
const porCategoria = new Map();
for (const p of todas) {
  const lista = porCategoria.get(p.categoria) ?? [];
  lista.push(p);
  porCategoria.set(p.categoria, lista);
}

let orden = 0;
for (const [categoria, lista] of porCategoria) {
  orden++;
  const archivo = path.join(destino, `${String(orden).padStart(2, "0")}-${slug(categoria)}.json`);
  // Conserva las claves ya escritas a mano
  const previas = new Map();
  try {
    for (const p of JSON.parse(await readFile(archivo, "utf8")).preguntas) previas.set(p.id, p);
  } catch {
    /* archivo nuevo */
  }
  const preguntas = lista.map((p) => {
    const id = `ent-${String(p.numero).padStart(3, "0")}`;
    const { numero, categoria: _c, ...resto } = p;
    return { id, ...resto, claves: previas.get(id)?.claves ?? [] };
  });
  await writeFile(archivo, JSON.stringify({ categoria, preguntas }, null, 2) + "\n");
  console.log(`${path.basename(archivo)}: ${preguntas.length} preguntas`);
}
console.log(`Total: ${todas.length} preguntas`);
