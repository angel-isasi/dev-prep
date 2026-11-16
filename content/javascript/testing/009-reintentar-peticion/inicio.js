// Tests para conReintentos(pedir, intentos)
//
// La función ya existe y funciona. Tu trabajo: escribir los tests que atrapen
// sus posibles errores. La app la corre contra la versión correcta (tus tests
// deben pasar) y contra 6 versiones con un error escondido (deben fallar).
//
// Escribe cada test con test("qué prueba", async () => { ... }).
// Como la función es async, usa await dentro de tus tests.

export function misTests({ test, expect }, conReintentos) {
  test("si funciona a la primera, devuelve los datos", async () => {
    const pedir = async () => "datos";
    expect(await conReintentos(pedir, 3)).toBe("datos");
  });

  // Agrega aquí más tests. Pistas: fabrica un `pedir` que falle algunas veces
  // y cuenta cuántas veces lo llamaron con un contador (let llamadas = 0).
  // ¿Qué pasa si falla 2 veces y a la tercera funciona? ¿Y si falla siempre?
}
