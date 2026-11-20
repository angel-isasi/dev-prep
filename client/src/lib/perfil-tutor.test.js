import { describe, expect, it } from "vitest";
import { armarPerfil } from "./perfil-tutor.js";

describe("memoria del tutor", () => {
  it("resume temas flojos, dominados, errores y pitch", () => {
    const texto = armarPerfil({
      mapa: {
        unidades: [
          { titulo: "Closures", estado: "rojo", valor: 0.2 },
          { titulo: "Arrays", estado: "verde", valor: 0.9 },
          { titulo: "React", estado: "sin-empezar", valor: 0 },
        ],
      },
      errores: [{ nombre: "Devuelve undefined", veces: 4 }],
      mis: { pitch: "Soy Angel y construí dev-prep." },
      inglesErrores: ["I have 20 years → I am 20 years old"],
    });
    expect(texto).toContain("Temas flojos: Closures");
    expect(texto).toContain("Temas que ya domina: Arrays");
    expect(texto).not.toContain("React");
    expect(texto).toContain("Devuelve undefined (4)");
    expect(texto).toContain("I am 20 years old");
    expect(texto).toContain("dev-prep");
  });

  it("sin datos dice que recién empieza", () => {
    expect(armarPerfil({ mapa: { unidades: [{ titulo: "X", estado: "sin-empezar", valor: 0 }] } })).toContain("Recién empieza");
  });
});
