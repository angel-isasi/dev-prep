export function aplanar(comentarios, nivel = 0) {
  return comentarios.flatMap((comentario) => [
    // Primero el comentario con su nivel...
    { id: comentario.id, texto: comentario.texto, nivel },
    // ...y enseguida todas sus respuestas, un nivel más adentro (recursión).
    ...aplanar(comentario.respuestas ?? [], nivel + 1),
  ]);
}

const SANGRIA_PX = 24;

export function Hilo({ comentarios }) {
  return (
    <ul>
      {aplanar(comentarios).map((comentario) => (
        <li key={comentario.id} style={{ marginLeft: comentario.nivel * SANGRIA_PX }}>
          {comentario.texto}
        </li>
      ))}
    </ul>
  );
}
