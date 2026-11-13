// Recibe los datos crudos y los filtros; devuelve todo lo que la pantalla muestra.
export function seleccionar(pizzas, { busqueda = "", soloVeggie = false } = {}) {
  const texto = busqueda.trim().toLowerCase();

  const visibles = pizzas.filter(
    (pizza) => pizza.nombre.toLowerCase().includes(texto) && (!soloVeggie || pizza.veggie),
  );

  // toSorted devuelve una copia ordenada: `visibles` conserva su orden.
  const masBarata = visibles.toSorted((a, b) => a.precio - b.precio)[0] ?? null;

  return { visibles, cantidad: visibles.length, masBarata };
}
