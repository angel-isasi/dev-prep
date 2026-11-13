export function Pedido({ items }) {
  // Caso vacío primero: return temprano y listo.
  if (items.length === 0) {
    return <p>Tu pedido está vacío. Agrega una pizza del menú.</p>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
