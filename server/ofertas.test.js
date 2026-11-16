import { describe, expect, test } from "vitest";
import { analizarOferta } from "./ofertas.js";

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
});
