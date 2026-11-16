// Tests para productosBaratos(productos, precioMaximo)
//
// La función ya existe y funciona. Tu trabajo: escribir los tests que atrapen
// sus posibles errores. La app la corre contra la versión correcta (tus tests
// deben pasar) y contra 5 versiones con un error escondido (deben fallar).
//
// Escribe cada test con test("qué prueba", () => { expect(...)... }).

export function misTests({ test, expect }, productosBaratos) {
  test("deja fuera los productos caros", () => {
    const productos = [
      { id: 1, nombre: "Mouse", precio: 30 },
      { id: 2, nombre: "Monitor", precio: 500 },
    ];
    expect(productosBaratos(productos, 100)).toEqual([{ id: 1, nombre: "Mouse", precio: 30 }]);
  });

  // Agrega aquí más tests. Pistas: ¿el orden es el correcto con precios de
  // distinta cantidad de cifras? ¿Entra el que cuesta justo el máximo?
  // ¿El arreglo que le pasaste sigue igual después de llamar a la función?
}
