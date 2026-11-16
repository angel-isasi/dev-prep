import { useEffect, useState } from "react";

export function TareasConReintento() {
  const [estado, setEstado] = useState({ cargando: true, error: false, tareas: [] });
  // Cada clic en "Reintentar" suma 1. Como `intento` está en las dependencias,
  // el efecto vuelve a correr y hace una petición nueva.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let ignorar = false;
    setEstado({ cargando: true, error: false, tareas: [] });

    fetch("/api/practica/tareas")
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
        return respuesta.json();
      })
      .then((tareas) => {
        if (!ignorar) setEstado({ cargando: false, error: false, tareas });
      })
      .catch(() => {
        if (!ignorar) setEstado({ cargando: false, error: true, tareas: [] });
      });

    return () => {
      ignorar = true;
    };
  }, [intento]);

  if (estado.cargando) return <p role="status">Cargando tareas...</p>;

  if (estado.error) {
    return (
      <div>
        <p role="alert">No se pudieron cargar las tareas.</p>
        <button type="button" onClick={() => setIntento((n) => n + 1)}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <ul>
      {estado.tareas.map((tarea) => (
        <li key={tarea.id}>
          {tarea.titulo}
          {tarea.hecha ? " (hecha)" : ""}
        </li>
      ))}
    </ul>
  );
}
