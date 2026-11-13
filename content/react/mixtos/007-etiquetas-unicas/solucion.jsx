export function Etiquetas({ pizzas }) {
  // flatMap junta todos los arreglos internos en uno solo.
  const todas = pizzas.flatMap((pizza) => pizza.etiquetas);
  // Un Set no guarda repetidos; el spread lo vuelve a convertir en arreglo.
  const unicas = [...new Set(todas)].sort((a, b) => a.localeCompare(b, "es"));

  return (
    <ul>
      {unicas.map((etiqueta) => (
        <li key={etiqueta}>{etiqueta}</li>
      ))}
    </ul>
  );
}
