// Tests para contarPalabras(texto)

export function misTests({ test, expect }, contarPalabras) {
  test("cuenta cada palabra", () => {
    expect(contarPalabras("el gato y el perro")).toEqual({ el: 2, gato: 1, y: 1, perro: 1 });
  });

  test("no distingue mayúsculas y guarda la clave en minúsculas", () => {
    expect(contarPalabras("Hola hola HOLA")).toEqual({ hola: 3 });
  });

  test("ignora los signos de puntuación", () => {
    expect(contarPalabras("¿hola? hola, hola.")).toEqual({ hola: 3 });
  });

  test("respeta las tildes y la ñ", () => {
    expect(contarPalabras("año está")).toEqual({ año: 1, está: 1 });
  });

  test("separa también por saltos de línea y tabulaciones", () => {
    expect(contarPalabras("uno\ndos\ttres")).toEqual({ uno: 1, dos: 1, tres: 1 });
  });

  test("un texto vacío devuelve un objeto vacío", () => {
    expect(contarPalabras("")).toEqual({});
  });

  test("un texto de solo espacios devuelve un objeto vacío", () => {
    expect(contarPalabras("   ")).toEqual({});
  });
}
