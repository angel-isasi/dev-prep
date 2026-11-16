// Tests para paginar(lista, pagina, porPagina)

export function misTests({ test, expect }, paginar) {
  const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  test("la página 2 trae los elementos del 4 al 6", () => {
    expect(paginar(numeros, 2, 3).items).toEqual([4, 5, 6]);
  });

  test("la página 1 trae los primeros elementos", () => {
    expect(paginar(numeros, 1, 3)).toEqual({ items: [1, 2, 3], pagina: 1, totalPaginas: 4 });
  });

  test("la última página viene incompleta y cuenta como página", () => {
    expect(paginar(numeros, 4, 3)).toEqual({ items: [10], pagina: 4, totalPaginas: 4 });
  });

  test("una página mayor que el total muestra la última", () => {
    expect(paginar(numeros, 99, 3)).toEqual({ items: [10], pagina: 4, totalPaginas: 4 });
  });

  test("una página menor que 1 muestra la primera", () => {
    expect(paginar(numeros, 0, 3)).toEqual({ items: [1, 2, 3], pagina: 1, totalPaginas: 4 });
  });

  test("una lista vacía tiene 1 página sin elementos", () => {
    expect(paginar([], 1, 3)).toEqual({ items: [], pagina: 1, totalPaginas: 1 });
  });
}
