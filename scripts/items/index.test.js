import { test, expect } from "vitest";
import { generarItems } from "./index.js";

const ejercicio = (id, coleccion, tema, ext = "js") => ({
  id,
  titulo: `Ejercicio ${id}`,
  tema,
  coleccion,
  ext,
  archivos: { solucion: `solucion.${ext}`, tests: `tests.test.${ext}` },
});

const SOLUCION = `export function contar(nums) {
  let total = 0;
  for (const n of nums) {
    if (n > 0) total++;
  }
  return nums.filter((n) => n > 0).length === total ? total : 0;
}
`;

const ARCHIVOS = {
  "solucion.js": SOLUCION,
  "explicacion.md": "## Idea clave\n\nCuenta los positivos.\n\n## Paso a paso\n\nNada.",
};

const indice = {
  ejercicios: [
    ejercicio("js-1", "javascript/ejercicios", "arrays"),
    ejercicio("js-reto-1", "javascript/retos", "arrays"),
    ejercicio("alg-1", "algoritmos/retos", "algoritmos"),
    ejercicio("raro-1", "javascript/ejercicios", "cobol"),
  ],
};
const temas = [
  {
    id: "arrays",
    titulo: "Arrays",
    area: "javascript",
    orden: 4,
    ejercicios: ["js-1", "js-reto-1"],
    quiz: [{ pregunta: "¿?", opciones: ["a", "b", "c"], correcta: 1, explicacion: "b." }],
  },
];
const referencia = { entradas: [] };
const leerArchivo = async (ej, archivo) => ARCHIVOS[archivo] ?? null;

test("arma unidades, ítems y resumen; los retos de entrevista no dan hueco, ordenar ni tarjeta", async () => {
  const r = await generarItems({ indice, temas, referencia, leerArchivo });
  expect(r.version).toBe(1);
  expect(r.unidades.map((u) => u.id)).toEqual(["arrays", "algoritmos"]);
  const claves = r.items.map((i) => i.clave);
  expect(claves).toContain("quiz:arrays:0");
  expect(claves).toContain("ej:js-1");
  expect(claves).toContain("ej:alg-1");
  expect(claves).toContain("hueco:js-1:filter");
  expect(claves).toContain("ordenar:js-1");
  expect(claves.some((c) => c.includes("js-reto-1"))).toBe(false);
  expect(new Set(claves).size).toBe(claves.length);
  // el ejercicio sin unidad se avisa en el resumen
  expect(r.resumen.sinUnidad).toEqual(["raro-1"]);
  expect(r.resumen.total).toBe(r.items.length);
  expect(r.resumen.porTipo).toMatchObject({ "opcion/quiz": 1, tarjeta: 2, ordenar: 2 });
  expect(r.resumen.porUnidad).toEqual({ arrays: r.items.filter((i) => i.unidad === "arrays").length, algoritmos: 3 });
  // ordenados por unidad
  const ultimaArrays = r.items.map((i) => i.unidad).lastIndexOf("arrays");
  expect(r.items.slice(ultimaArrays + 1).every((i) => i.unidad === "algoritmos")).toBe(true);
});

test("la misma entrada da exactamente la misma salida", async () => {
  const a = await generarItems({ indice, temas, referencia, leerArchivo });
  const b = await generarItems({ indice, temas, referencia, leerArchivo });
  expect(JSON.stringify(a)).toBe(JSON.stringify(b));
});
