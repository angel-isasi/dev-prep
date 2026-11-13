export function Menu({ pizzas }) {
  return (
    <ul>
      {pizzas.map((pizza) => (
        <li key={pizza.id}>{pizza.nombre}</li>
      ))}
    </ul>
  );
}
