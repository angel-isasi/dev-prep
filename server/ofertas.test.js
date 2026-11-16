import { describe, expect, test } from "vitest";
import { analizarOferta, palabrasParaCv } from "./ofertas.js";

describe("¿estoy listo para esta oferta?", () => {
  const mapa = [
    { id: "react-jsx-y-componentes", valor: 0.9 },
    { id: "react-props-y-children", valor: 0.8 },
    { id: "variables-y-tipos", valor: 0.2 },
  ];
  test("detecta tecnologías y las cruza con lo que dominas", () => {
    const r = analizarOferta("Buscamos Frontend Developer Jr con React, TypeScript, Git e inglés intermedio.", mapa, { inglesDominadas: 21, inglesTotal: 33 });
    const por = Object.fromEntries(r.tecnologias.map((t) => [t.nombre, t.estado]));
    expect(por.React).toBe("en-progreso"); // promedia todas sus unidades, algunas sin empezar
    expect(por.TypeScript).toBe("por-empezar");
    expect(por.Git).toBe("no-esta");
    expect(por["Inglés"]).toBe("en-progreso");
  });
  test("React Native no cuenta como React", () => {
    expect(analizarOferta("Experiencia con React Native", mapa).tecnologias.map((t) => t.nombre)).not.toContain("React");
  });
  test("'Practicar lo que falta' lleva a la lección de la unidad más floja", () => {
    const por = Object.fromEntries(analizarOferta("React, Git e inglés", mapa).tecnologias.map((t) => [t.nombre, t.ruta]));
    // De React, la más floja es una que no empezaste (valor 0), no las que ya dominas
    expect(por.React).toMatch(/^\/leccion\?unidad=react-/);
    expect(por.React).not.toContain("react-jsx-y-componentes");
    expect(por.Git).toBeNull(); // no está en dev-prep
    expect(por["Inglés"]).toBe("/ingles");
  });
});

describe("palabras clave para tu CV", () => {
  const tecnologias = [
    { nombre: "React", estado: "dominas" },
    { nombre: "JavaScript", estado: "en-progreso" },
    { nombre: "TypeScript", estado: "por-empezar" },
    { nombre: "Docker", estado: "no-esta" },
    { nombre: "Inglés", estado: "en-progreso" },
  ];
  test("separa lo que puedes agregar de lo que todavía no sabes", () => {
    expect(palabrasParaCv(tecnologias, "Desarrollador Frontend Junior. Proyectos con React.")).toEqual({
      agregar: ["JavaScript"],
      aprender: ["TypeScript", "Docker"],
    });
  });
  test("si ya está en tu CV, no la pide", () => {
    expect(palabrasParaCv(tecnologias, "React, JavaScript, TypeScript y Docker").agregar).toEqual([]);
    expect(palabrasParaCv(tecnologias, "React, JavaScript, TypeScript y Docker").aprender).toEqual([]);
  });
});
