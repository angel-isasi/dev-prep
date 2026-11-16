// Tests para formatearNombre(texto)

export function misTests({ test, expect }, formatearNombre) {
  test("pone mayúscula a cada palabra", () => {
    expect(formatearNombre("ana pérez")).toBe("Ana Pérez");
  });

  test("quita los espacios del inicio y del final", () => {
    expect(formatearNombre("  Ana Pérez  ")).toBe("Ana Pérez");
  });

  test("deja un solo espacio entre palabras", () => {
    expect(formatearNombre("Ana     Pérez")).toBe("Ana Pérez");
  });

  test("pasa a minúscula el resto de cada palabra", () => {
    expect(formatearNombre("JUAN CARLOS")).toBe("Juan Carlos");
  });

  test("pone mayúscula a una inicial con tilde o ñ", () => {
    expect(formatearNombre("ángel ñuñez")).toBe("Ángel Ñuñez");
  });

  test("con solo espacios devuelve un texto vacío", () => {
    expect(formatearNombre("   ")).toBe("");
  });

  test("ordena un nombre con todos los problemas juntos", () => {
    expect(formatearNombre("  ana   PÉREZ ")).toBe("Ana Pérez");
  });
}
