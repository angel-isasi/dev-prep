import { describe, expect, it } from "vitest";
import { armarIndice, buscar, normalizar } from "./paleta.js";

const indice = armarIndice({
  secciones: [
    { a: "/aprender", texto: "Aprender", sub: [{ a: "/aprender", texto: "Temas" }, { a: "/glosario", texto: "Glosario" }] },
    { a: "/practicar", texto: "Practicar", sub: [] },
  ],
  acciones: [{ titulo: "Modo enfoque", a: "/enfoque", claves: "pomodoro concentrarme" }],
  temas: [
    { id: "closures-y-scope", titulo: "Closures y scope", descripcion: "Scope léxico y closures", area: "javascript" },
    { id: "funciones", titulo: "Funciones", descripcion: "Declaración, expresión y flecha", area: "javascript" },
  ],
  ejercicios: [
    { id: "js-ej-001", titulo: "Duplicar", coleccion: "javascript/ejercicios", tema: "arrays", tags: ["map"] },
    { id: "js-re-004", titulo: "Contador con closure", coleccion: "javascript/retos", tema: "closures", tags: ["closure"] },
  ],
  referencia: [{ nombre: "Array.map()", descripcion: "Transforma cada elemento", categoria: "Arrays", tags: ["transformar"] }],
  glosario: [{ termino: "Closure", definicion: "Una función que recuerda", en: "closure" }],
  preguntas: [{ id: "ent-031", pregunta: "¿Qué es un closure?", categoria: "JavaScript" }],
});

const titulos = (grupos) => grupos.flatMap((g) => g.entradas.map((e) => e.titulo));

describe("normalizar", () => {
  it("quita tildes y mayúsculas", () => {
    expect(normalizar("Función Asíncrona")).toBe("funcion asincrona");
  });
});

describe("buscar", () => {
  it("sin texto solo muestra a dónde ir", () => {
    const grupos = buscar(indice, "");
    expect(grupos.map((g) => g.grupo)).toEqual(["Ir a"]);
    expect(titulos(grupos)).toEqual(["Aprender", "Glosario", "Practicar", "Modo enfoque"]);
  });

  it("no repite el destino que es la portada de su sección", () => {
    expect(titulos(buscar(indice, "temas"))).toEqual([]);
  });

  it("junta el mismo concepto de todas las secciones", () => {
    const grupos = buscar(indice, "closure");
    expect(grupos.map((g) => g.grupo)).toEqual(["Temas", "Ejercicios", "Glosario", "Entrevistas"]);
    expect(grupos.find((g) => g.grupo === "Glosario").entradas[0].a).toBe("/glosario?q=Closure");
  });

  it("encuentra sin tildes y por palabras del detalle", () => {
    expect(titulos(buscar(indice, "funcion"))).toContain("Funciones");
    expect(titulos(buscar(indice, "pomodoro"))).toEqual(["Modo enfoque"]);
    expect(titulos(buscar(indice, "transformar"))).toEqual(["Array.map()"]);
  });

  it("exige todas las palabras", () => {
    expect(titulos(buscar(indice, "contador closure"))).toEqual(["Contador con closure"]);
    expect(buscar(indice, "closure inexistente")).toEqual([]);
  });

  it("pone primero el título que empieza con lo buscado", () => {
    const ejercicios = buscar(indice, "c").find((g) => g.grupo === "Ejercicios").entradas;
    expect(ejercicios[0].titulo).toBe("Contador con closure");
  });

  it("respeta el tope por grupo", () => {
    const muchos = armarIndice({ ejercicios: Array.from({ length: 20 }, (_, i) => ({ id: `e${i}`, titulo: `Suma ${i}` })) });
    expect(buscar(muchos, "suma", { porGrupo: 5 })[0].entradas).toHaveLength(5);
  });
});
