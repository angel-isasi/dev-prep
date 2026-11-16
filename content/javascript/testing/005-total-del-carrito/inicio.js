// Tests para totalCarrito(items, cupon)
//
// La función ya existe y funciona. Tu trabajo: escribir los tests que atrapen
// sus posibles errores. La app la corre contra la versión correcta (tus tests
// deben pasar) y contra 6 versiones con un error escondido (deben fallar).
//
// Escribe cada test con test("qué prueba", () => { expect(...)... }).

export function misTests({ test, expect }, totalCarrito) {
  test("suma los precios y cobra envío", () => {
    expect(totalCarrito([{ precio: 30, cantidad: 1 }, { precio: 20, cantidad: 1 }])).toBe(65);
  });

  // Agrega aquí más tests. Pistas: este ejemplo usa cantidad 1, ¿y si es 3?
  // ¿Qué pasa con un subtotal de 100 justos? ¿Y con el cupón en minúsculas?
}
