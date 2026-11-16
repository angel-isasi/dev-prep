import { useEffect, useState } from "react";

// Perfil de un alumno
//
// Recibe `id` y cargarAlumno(id), que devuelve una promesa con { nombre }.
// Muestra "Cargando…" y luego el nombre en un <h2>.
// Si el id cambia, carga y muestra al alumno nuevo.

export function Perfil({ id, cargarAlumno }) {
  const [alumno, setAlumno] = useState(null);

  useEffect(() => {
    setAlumno(null);
    cargarAlumno(id).then(setAlumno);
  }, []);

  if (!alumno) return <p>Cargando…</p>;
  return <h2>{alumno.nombre}</h2>;
}
