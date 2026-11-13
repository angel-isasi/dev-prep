export function MasVendidas({ ventas }) {
  // { Margarita: 40, ... } -> [["Margarita", 40], ...] -> ordenado -> primeros 3
  const top = Object.entries(ventas)
    .toSorted(([, cantidadA], [, cantidadB]) => cantidadB - cantidadA)
    .slice(0, 3);

  return (
    <ol>
      {top.map(([nombre, cantidad]) => (
        <li key={nombre}>
          {nombre} ({cantidad})
        </li>
      ))}
    </ol>
  );
}
