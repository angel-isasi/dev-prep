export function Disponibles({ pizzas }) {
  // filter devuelve un arreglo nuevo y toSorted ordena una copia:
  // la prop `pizzas` queda intacta.
  const lista = pizzas
    .filter((pizza) => pizza.disponible)
    .toSorted((a, b) => a.precio - b.precio);

  return (
    <ol>
      {lista.map((pizza) => (
        <li key={pizza.nombre}>{pizza.nombre}</li>
      ))}
    </ol>
  );
}
