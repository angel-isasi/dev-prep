// Tests para contarPalabras(texto)
//
// La función ya existe y funciona. Tu trabajo: escribir los tests que atrapen
// sus posibles errores. La app la corre contra la versión correcta (tus tests
// deben pasar) y contra 6 versiones con un error escondido (deben fallar).
//
// Escribe cada test con test("qué prueba", () => { expect(...)... }).

export function misTests({ test, expect }, contarPalabras) {
  test("cuenta cada palabra", () => {
    expect(contarPalabras("el gato y el perro")).toEqual({ el: 2, gato: 1, y: 1, perro: 1 });
  });

  // Agrega aquí más tests. Pista: ¿mayúsculas? ¿signos? ¿tildes y ñ?
  // ¿saltos de línea? ¿texto vacío?
}
