import { describe, expect, it } from "vitest";
import { frasesListas, paraVoz } from "./frases.js";

describe("paraVoz", () => {
  it("no lee el código ni las marcas de Markdown", () => {
    expect(paraVoz("Mira esto: ```js\nconst a = 1;\n``` y **listo**.")).toBe("Mira esto:   y listo.");
  });

  it("un bloque de código que todavía no se cierra se corta ahí", () => {
    expect(paraVoz("Así:\n```js\nconst a")).toBe("Así:\n");
  });
});

describe("frasesListas", () => {
  it("devuelve las frases completas y deja lo que va a medias", () => {
    const nuevo = "Bien hecho. Ahora prueba con un array vac";
    const { frases, usado } = frasesListas(nuevo);
    expect(frases).toEqual(["Bien hecho."]);
    expect(nuevo.slice(usado)).toBe(" Ahora prueba con un array vac");
  });

  it("no corta en el punto de un número", () => {
    expect(frasesListas("Cuesta 1.5 dólares").frases).toEqual([]);
  });

  it("al final dice todo lo que quede", () => {
    expect(frasesListas("¿Y si viene vacío?", true).frases).toEqual(["¿Y si viene vacío?"]);
  });

  it("ignora trozos sin palabras", () => {
    expect(frasesListas("Hola.\n\n...\nChau.\n").frases).toEqual(["Hola.", "Chau."]);
  });
});
