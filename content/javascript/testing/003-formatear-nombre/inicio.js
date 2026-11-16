// Tests para formatearNombre(texto)
//
// La función ya existe y funciona. Tu trabajo: escribir los tests que atrapen
// sus posibles errores. La app la corre contra la versión correcta (tus tests
// deben pasar) y contra 6 versiones con un error escondido (deben fallar).
//
// Escribe cada test con test("qué prueba", () => { expect(...)... }).

export function misTests({ test, expect }, formatearNombre) {
  test("pone mayúscula a cada palabra", () => {
    expect(formatearNombre("ana pérez")).toBe("Ana Pérez");
  });

  // Agrega aquí más tests. Pista: ¿qué pasa con los espacios de los bordes,
  // los espacios repetidos, las mayúsculas, las tildes y el texto vacío?
}
