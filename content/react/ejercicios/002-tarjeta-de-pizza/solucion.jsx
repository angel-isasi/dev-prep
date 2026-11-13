export function Pizza({ nombre, descripcion, precio }) {
  return (
    <article>
      <h2>{nombre}</h2>
      <p>{descripcion}</p>
      <p>S/ {precio.toFixed(2)}</p>
    </article>
  );
}
