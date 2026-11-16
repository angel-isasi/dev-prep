// Corre los generadores sobre el contenido REAL de content/ y revisa invariantes.
// Si un cambio de contenido rompe alguna, este test lo avisa antes de exportar al celular.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { beforeAll, describe, test, expect } from "vitest";
import { config } from "../../server/config.js";
import { crearIndice } from "../../server/contenido.js";
import { cargarReferencia, cargarTemas } from "../../server/aprender.js";
import { COLECCIONES_SIN_SOLUCION, generarItems, tipoDe } from "./index.js";
import { CATEGORIA_A_UNIDAD, unidadDeEjercicio } from "./unidades.js";
import { normalizar } from "./util.js";

let indice;
let temas;
let referencia;
let resultado;

beforeAll(async () => {
  indice = await crearIndice(config.contenidoDir);
  temas = (await cargarTemas(config.contenidoDir)).temas;
  referencia = await cargarReferencia(config.contenidoDir);
  const leerArchivo = (ej, archivo) => readFile(path.join(ej.carpeta, archivo), "utf8").catch(() => null);
  resultado = await generarItems({ indice, temas, referencia, leerArchivo });
}, 30_000);

describe("ítems del contenido real", () => {
  test("todo tema de ejercicio y toda categoría de Referencia tienen unidad", () => {
    const sinUnidad = indice.ejercicios.filter((ej) => !unidadDeEjercicio(ej, temas)).map((ej) => `${ej.id} (${ej.tema})`);
    expect(sinUnidad).toEqual([]);
    const categorias = referencia.categorias.map((c) => c.nombre).filter((c) => !CATEGORIA_A_UNIDAD[c]);
    expect(categorias).toEqual([]);
  });

  test("claves únicas y unidades que existen", () => {
    const claves = resultado.items.map((i) => i.clave);
    expect(new Set(claves).size).toBe(claves.length);
    const unidades = new Set(resultado.unidades.map((u) => u.id));
    expect(resultado.items.filter((i) => !unidades.has(i.unidad))).toEqual([]);
  });

  test("toda unidad tiene al menos 5 ítems", () => {
    const flacas = Object.entries(resultado.resumen.porUnidad).filter(([, n]) => n < 5);
    expect(flacas).toEqual([]);
  });

  test("opciones sin repetir y una correcta dentro del rango", () => {
    const malos = [];
    for (const it of resultado.items.filter((i) => i.opciones)) {
      const ok =
        Number.isInteger(it.correcta) &&
        it.correcta >= 0 &&
        it.correcta < it.opciones.length &&
        new Set(it.opciones.map(normalizar)).size === it.opciones.length &&
        (it.tipo !== "hueco" || it.opciones.length === 4);
      if (!ok) malos.push(it.clave);
    }
    expect(malos).toEqual([]);
  });

  test("TypeScript: opciones exactas y línea marcada dentro del código", () => {
    for (const it of resultado.items.filter((i) => i.subtipo === "ts")) {
      expect(it.opciones).toEqual(["Compila", "Da error"]);
      expect(it.codigo.texto.split("\n")[it.codigo.marcar]?.trim()).toBeTruthy();
    }
    for (const it of resultado.items.filter((i) => i.codigo?.marcar !== undefined)) {
      expect(it.codigo.marcar).toBeLessThan(it.codigo.texto.split("\n").length);
    }
  });

  test("ningún hueco, ordenar ni tarjeta sale de los retos de entrevista (salvo algoritmos)", () => {
    const coleccion = new Map(indice.ejercicios.map((ej) => [ej.id, ej.coleccion]));
    const prohibidos = resultado.items.filter(
      (i) =>
        ["hueco", "ordenar", "tarjeta"].includes(i.tipo) &&
        (COLECCIONES_SIN_SOLUCION.includes(coleccion.get(i.fuente.id)) ||
          (/\/retos$/.test(coleccion.get(i.fuente.id)) && coleccion.get(i.fuente.id) !== "algoritmos/retos")),
    );
    expect(prohibidos.map((i) => i.clave)).toEqual([]);
  });

  test("formas de cada tipo", () => {
    for (const it of resultado.items) {
      expect(["tema", "referencia", "ejercicio"]).toContain(it.fuente.tipo);
      if (it.tipo === "emparejar") {
        expect(it.pares).toHaveLength(4);
        expect(new Set(it.pares.map((p) => normalizar(p.der))).size).toBe(4);
      }
      if (it.tipo === "ordenar") {
        expect(it.lineas.length).toBeGreaterThanOrEqual(4);
        expect(it.lineas.length).toBeLessThanOrEqual(12);
      }
      if (it.tipo === "hueco") expect(it.codigo.texto).toContain("____");
      if (it.tipo === "tarjeta") expect(it.ejercicio).toBe(it.fuente.id);
    }
  });

  test("sin raya larga en los textos", () => {
    const conRaya = resultado.items.filter((i) => JSON.stringify(i).includes("—")).map((i) => i.clave);
    expect(conRaya).toEqual([]);
  });

  test("hay ítems de todos los tipos", () => {
    for (const tipo of ["opcion/quiz", "opcion/metodo", "opcion/devuelve", "opcion/ts", "emparejar", "hueco", "ordenar", "tarjeta"]) {
      expect(resultado.items.some((i) => tipoDe(i) === tipo)).toBe(true);
    }
  });
});
