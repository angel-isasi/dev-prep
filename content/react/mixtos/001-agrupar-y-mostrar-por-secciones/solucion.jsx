// Agrupa los elementos de una lista según el valor de una de sus propiedades.
export function agrupar(lista, clave) {
  return lista.reduce((grupos, item) => {
    const valor = item[clave];
    // Si el grupo todavía no existe, lo crea vacío; luego agrega el item.
    (grupos[valor] ??= []).push(item);
    return grupos;
  }, {});
}

export function MenuPorCategoria({ pizzas }) {
  const grupos = agrupar(pizzas, "categoria");

  return (
    <>
      {Object.entries(grupos).map(([categoria, items]) => (
        <section key={categoria} aria-label={categoria}>
          <h2>{categoria}</h2>
          <ul>
            {items.map((pizza) => (
              <li key={pizza.nombre}>{pizza.nombre}</li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
