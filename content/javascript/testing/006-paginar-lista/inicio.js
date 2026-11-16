// Tests para paginar(lista, pagina, porPagina)
//
// La función ya existe y funciona. Tu trabajo: escribir los tests que atrapen
// sus posibles errores. La app la corre contra la versión correcta (tus tests
// deben pasar) y contra 5 versiones con un error escondido (deben fallar).
//
// Escribe cada test con test("qué prueba", () => { expect(...)... }).

export function misTests({ test, expect }, paginar) {
  const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  test("la página 2 trae los elementos del 4 al 6", () => {
    expect(paginar(numeros, 2, 3).items).toEqual([4, 5, 6]);
  });

  // Agrega aquí más tests. Pista: prueba la primera página, la última
  // (que viene incompleta), una página que no existe y la lista vacía.
}
