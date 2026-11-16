// Tests para precioConDescuento(precio, porcentaje)
//
// La función ya existe y funciona. Tu trabajo: escribir los tests que atrapen
// sus posibles errores. La app la corre contra la versión correcta (tus tests
// deben pasar) y contra 4 versiones con un error escondido (deben fallar).
//
// Escribe cada test con test("qué prueba", () => { expect(...)... }).

export function misTests({ test, expect }, precioConDescuento) {
  test("aplica un 20 % de descuento", () => {
    expect(precioConDescuento(100, 20)).toBe(80);
  });

  // Agrega aquí más tests. Pista: los errores suelen esconderse en los límites.
}
