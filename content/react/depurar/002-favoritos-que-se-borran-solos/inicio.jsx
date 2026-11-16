// Lista de favoritos
//
// Muestra cada favorito con un botón "Quitar". Al hacer clic en "Quitar",
// llama a onQuitar con el id de ese favorito (el padre lo borra de su estado).
//
//   <ListaFavoritos favoritos={[{ id: 1, nombre: "Curso de React" }]} onQuitar={quitar} />

export function ListaFavoritos({ favoritos, onQuitar }) {
  return (
    <ul>
      {favoritos.map((fav) => (
        <li key={fav.id}>
          {fav.nombre}
          <button onClick={onQuitar(fav.id)}>Quitar</button>
        </li>
      ))}
    </ul>
  );
}
