// Tests para esClaveSegura(clave)
//
// La función ya existe y funciona. Tu trabajo: escribir los tests que atrapen
// sus posibles errores. La app la corre contra la versión correcta (tus tests
// deben pasar) y contra 6 versiones con un error escondido (deben fallar).
//
// Escribe cada test con test("qué prueba", () => { expect(...)... }).

export function misTests({ test, expect }, esClaveSegura) {
  test("acepta una contraseña normal", () => {
    expect(esClaveSegura("Segura123")).toBe(true);
  });

  // Agrega aquí más tests. Pista: prueba el largo justo en los bordes
  // (lo que entra y lo que ya no entra) y cada regla por separado.
}
